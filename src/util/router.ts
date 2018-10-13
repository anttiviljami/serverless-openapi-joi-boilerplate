import _ from 'lodash';
import Boom from 'boom';
import Joi from 'joi';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { getOpenAPISpec } from '../core/openapi-core';

import { createLogger } from './logger';
const logger = createLogger(__filename);

export interface Route {
  method: string;
  path: string;
  operationId: string;
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
  handler: (event: Partial<APIGatewayProxyEvent>) => Promise<any>;
}

export async function routeEvent(event: Partial<APIGatewayProxyEvent>, routes: Route[]): Promise<any> {
  const { path } = event;

  // swagger.json is a special endpoint that uses route information to generate openapi docs
  if (path.match(/^\/swagger.json/)) {
    return getOpenAPISpec(routes);
  }

  // route using pseudo-hapi routes
  return handleRoute(event, routes);
}

// dank version of hapi's routing + joi validation
async function handleRoute(event: Partial<APIGatewayProxyEvent>, routes: Route[]) {
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
      headers: Joi.object().unknown(),
      queryStringParameters: Joi.object().unknown(),
    };

    const validationResult = Joi.validate(input, {
      ...validationDefaults,
      ...validation,
    });

    // throw a 400 error if there are any validation errors
    if (validationResult.error) {
      throw Boom.badRequest(validationResult.error.message);
    }
  }

  // pass event to handler
  return handler(event);
}
