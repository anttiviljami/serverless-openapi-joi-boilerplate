import _ from 'lodash';
import { SchemaLike } from 'joi';
import joi2json from 'joi-to-json-schema';
import { Route } from '../util/router';

export function getOpenAPISpec(routes: Route[], baseurl?: string) {
  const OPENAPI_VERSION = '3.0.0';
  const title = 'Example Serverless Pet API';
  const description = 'Example CRUD API to demonstrate auto-generated openapi docs with Joi';
  const version = '0.1.0';
  const server = {
    url: baseurl || process.env.BASEURL,
  };
  const securitySchemes = {
    'ApiKey': {
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
    },
  };
  const security = _.chain(securitySchemes)
    .keys()
    .map((scheme: string) => ({ [scheme]: [] }))
    .value();

  const schemas: any[] = [];
  const requestBodies: any[] = [];
  const paths = _.chain(routes)
    .map((path) => routeToPathDef(path, schemas, requestBodies))
    .groupBy('path') // group by paths
    .mapValues((methods) => _.chain(methods)
      .keyBy('method') // group by methods
      .mapValues((method) => _.omit(method, ['method', 'path'])) // omit strip method property
      .value())
    .value();
  const tags = _.chain(routes)
    .flatMap('tags')
    .map((tag) => typeof tag === 'string' ? { name: tag } : tag)
    .sortBy('description')
    .uniqBy('name')
    .value();

  return {
    openapi: OPENAPI_VERSION,
    info: {
      title,
      description,
      version,
    },
    servers: [server],
    security,
    tags,
    paths,
    components: {
      securitySchemes,
      requestBodies: _.chain(requestBodies)
        .keyBy('ref')
        .mapValues((def) => _.omit(def, 'ref')) // omit ref property
        .value(),
      schemas: _.chain(schemas)
        .keyBy('ref')
        .mapValues((def) => _.omit(def, 'ref')) // omit ref property
        .value(),
    },
  };
}

// convert default
function nameToRef(name: string, context: string = '') {
  const nameStandardised = _.chain(name)
    .camelCase()
    .upperFirst()
    .value();
  return `${context}${nameStandardised}`;
}

// adds definitions from path validation to schemas array and returns the path definition itself
function routeToPathDef(route: Route, schemas: any[], requestBodies: any[]) {
  const { path, method, summary, description, validation } = route;
  const operationId = route.operationId ? route.operationId : route.handler.name;
  const responses = route.responses ? route.responses : {
    200: { description: 'Success' }, // default
  };
  let requestBody;
  const parameters: any[] = [];

  if (validation) {
    if (validation.headers) {
      _.mapValues(validation.headers, (joi: SchemaLike, name: string) => {
        const ref = createOpenAPIDef(nameToRef(name, `${operationId}Header`), joi, schemas);
        const joiDescription = _.get(joi, '_description') || `Request header: ${name}`;
        const joiRequired = _.get(joi, '_flags.presence', 'optional') === 'required';
        parameters.push({
          name,
          in: 'header',
          description: joiDescription,
          required: joiRequired,
          schema: {
            $ref: `#/components/schemas/${ref}`,
          },
        });
      });
    }

    if (validation.pathParameters) {
      _.mapValues(validation.pathParameters, (joi: SchemaLike, name: string) => {
        const ref = createOpenAPIDef(nameToRef(name, `${operationId}Path`), joi, schemas);
        const joiDescription = _.get(joi, '_description') || `Path parameter: ${name}`;
        parameters.push({
          name,
          in: 'path',
          description: joiDescription,
          required: true, // path params are always required
          schema: {
            $ref: `#/components/schemas/${ref}`,
          },
        });
      });
    }

    if (validation.queryStringParameters) {
      _.mapValues(validation.queryStringParameters, (joi: SchemaLike, name: string) => {
        const ref = createOpenAPIDef(nameToRef(name, `${operationId}Query`), joi, schemas);
        const joiDescription = _.get(joi, '_description') || `Query parameter: ${name}`;
        const joiRequired = _.get(joi, '_flags.presence', 'optional') === 'required';
        parameters.push({
          name,
          in: 'query',
          description: joiDescription,
          required: joiRequired,
          schema: {
            $ref: `#/components/schemas/${ref}`,
          },
        });
      });
    }

    if (validation.payload) {
      const joi = validation.payload;
      const payloadRef = `${nameToRef(operationId)}Payload`;
      const schemaRef = createOpenAPIDef(payloadRef, joi, schemas);
      const joiDescription = _.get(joi, '_description') || `Request payload: ${operationId}`;
      requestBodies.push({
        ref: payloadRef,
        description: joiDescription,
        content: {
          'application/json': {
            schema: {
              $ref: `#/components/schemas/${schemaRef}`,
            },
          },
        },
      });
      requestBody = { $ref: `#/components/requestBodies/${payloadRef}` };
    }
  }

  const tags = _.chain(route.tags)
    .map((tag) => _.get(tag, 'name', tag))
    .value();

  return {
    path,
    method: method.toLowerCase(),
    operationId,
    summary,
    description,
    tags,
    responses,
    parameters,
    requestBody,
  };
}

// adds the definition to the definitons array, returns the reference
function createOpenAPIDef(name: string, joi: SchemaLike, schemas: any[]) {
  const def = joi2json(joi, (schema) => _.omit(schema, ['patterns', 'examples']));
  const ref = def.title || name;
  schemas.push({ ref, ...def });
  return ref;
}
