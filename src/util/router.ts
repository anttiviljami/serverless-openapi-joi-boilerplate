import _ from 'lodash';
import Boom from 'boom';
import Joi from 'joi';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { getOpenAPISpec } from '../core/openapi-core';

import { createLogger } from './/logger';
const logger = createLogger(__filename);

export interface HandlerEvent extends APIGatewayProxyEvent {
  payload: any;
}

export interface HandlerContext {
  raw: boolean; // true = pass raw return value to body, false = convert return value to json string
  statusCode: number;
  headers: {
    [header: string]: string;
  };
}

export interface HandlerResponse {
  statusCode: number;
  body: string | Buffer;
  headers: {
    [header: string]: string;
  };
}

export interface Route {
  method: string;
  path: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  validation?: {
    headers?: { [name: string]: Joi.SchemaLike }
    pathParameters?: { [name: string]: Joi.SchemaLike }
    queryStringParameters?: { [name: string]: Joi.SchemaLike; }
    payload?: Joi.SchemaLike;
  };
  responses?: {
    [responseCode: string]: {
      description: string;
      content?: any;
    };
  };
  handler: (event: Partial<HandlerEvent>, context?: HandlerContext) => Promise<any>;
}

export async function routeEvent(event: Partial<APIGatewayProxyEvent>, routes: Route[]): Promise<HandlerResponse> {
  const { path } = event;

  // swagger.json is a special endpoint that uses route information to generate openapi docs
  if (path.match(/^\/swagger.json/)) {
    return {
      statusCode: 200,
      body: JSON.stringify(getOpenAPISpec(routes)),
      headers: {
        'content-type': 'application/json',
      },
    };
  }

  // route using pseudo-hapi routes
  return handleRoute(event, routes);
}

// dank version of hapi's routing + joi validation
async function handleRoute(event: Partial<APIGatewayProxyEvent>, routes: Route[]): Promise<HandlerResponse> {
  const { httpMethod, path, pathParameters, queryStringParameters, body, headers } = event;
  logger.info(JSON.stringify({ httpMethod, path, pathParameters, queryStringParameters, body, headers }, null, 2));

  // sort routes by "specificity" i.e. just use path length 🙈
  const sortedRoutes = routes.sort((b, a) => a.path.length - b.path.length);

  // match first route
  const matchedRoute = _.find(sortedRoutes, (route) => {
    if (route.method !== httpMethod) {
      return false;
    }
    const pathPattern = route.path
      .replace(/\{.*\}/g, '(.+)')
      .replace(/\//g, '\\/');
    return path.match(new RegExp(`^${pathPattern}`, 'g'));
  });
  if (!matchedRoute) {
    throw Boom.notFound('Route not found');
  }

  const { handler, validation } = matchedRoute as Route;

  // try to extract json payload from body
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    // suppress any json parsing errors
  }

  // maybe validate payload, pathParameters, queryStringParameters, headers
  if (validation) {
    const input = _.omitBy({
      headers,
      payload,
      pathParameters,
      queryStringParameters,
    }, _.isNil);

    const validationDefaults = {
      queryStringParameters: Joi.object().unknown(),
    };

    const validationResult = Joi.validate(input, {
      ...validationDefaults,
      ...validation,
      headers: Joi.object(headers || {}).unknown(), // headers are always partially defined
    });

    // throw a 400 error if there are any validation errors
    if (validationResult.error) {
      throw Boom.badRequest(validationResult.error.message);
    }
  }

  // create mutable context object so handlers can change status codes and content types
  const context: HandlerContext = {
    raw: false,
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
  };

  // pass event to handler
  const res = await handler({ ...event, payload }, context);
  return {
    statusCode: context.statusCode || 200,
    headers: context.headers || {},
    body: context.raw ? res : JSON.stringify(res),
  };
}
