import _ from 'lodash';
import { SchemaLike } from 'joi';
import joi2json from 'joi-to-json-schema';
import { Route } from '../util/router';

export function getOpenAPISpec(routes: Route[]) {
  const OPENAPI_VERSION = '3.0.0';
  const title = 'Example pet API';
  const description = 'Example CRUD API to demonstrate auto-generated openapi docs with Joi';
  const version = '1.0.0';
  const server = {
    url: process.env.BASEURL,
  };
  const schemas: any[] = [];

  const paths = _.chain(routes)
    .map((path) => routeToPathDef(path, schemas))
    .groupBy('path') // group by paths
    .mapValues((methods) => _.chain(methods)
      .keyBy('method') // group by methods
      .mapValues((method) => _.omit(method, ['method', 'path'])) // omit strip method property
      .value())
    .value();

  return {
    openapi: OPENAPI_VERSION,
    info: {
      title,
      description,
      version,
    },
    servers: [server],
    paths,
    components: {
      schemas: _.chain(schemas)
        .keyBy('ref')
        .mapValues((def) => _.omit(def, 'ref')) // omit ref property
        .value(),
    },
  };
}

// adds definitions from path validation to schemas array and returns the path definition itself
function routeToPathDef(route: Route, schemas: any[]) {
  const { path, method, operationId, summary, description, tags, validation } = route;

  const responses = {
    '200': {
      description: 'Success',
    },
    default: {
      description: 'Unexpected error',
    },
    ...route.responses || {},
  };

  const parameters: any[] = [];

  if (validation) {
    if (validation.pathParameters) {
      _.mapValues(validation.pathParameters, (joi: SchemaLike, name: string) => {
        const defaultRef = `${operationId}Path${_.upperFirst(name)}`;
        const ref = createOpenAPIDef(defaultRef, joi, schemas);
        parameters.push({
          name,
          in: 'path',
          description: 'Path parameters',
          required: true, // path params are always required
          schema: {
            $ref: `#/components/schemas/${ref}`,
          },
        });
      });
    }
  }

  return {
    path,
    method: method.toLowerCase(),
    operationId,
    summary,
    description,
    tags,
    responses,
    parameters,
  };
}

// adds the definition to the definitons array, returns the reference
function createOpenAPIDef(name: string, joi: SchemaLike, schemas: any[]) {
  const ref = name;
  const def = joi2json(joi);
  schemas.push({ ref, ...def });
  // @TODO: read label property for better ref control
  return ref;
}
