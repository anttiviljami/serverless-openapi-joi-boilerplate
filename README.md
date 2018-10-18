# Serverless OpenAPI Joi Boilerplate Project
[![Build Status](https://travis-ci.org/anttiviljami/serverless-openapi-joi-boilerplate.svg?branch=master)](https://travis-ci.org/anttiviljami/serverless-openapi-joi-boilerplate) [![License](http://img.shields.io/:license-mit-blue.svg)](http://anttiviljami.mit-license.org)

Boilerplate serverless API project with generated OpenAPI docs (formerly known as swagger) from Joi validation.

Inspired by Hapi and [hapi-swagger](https://github.com/glennjones/hapi-swagger)

- [x] **Auto-generated OpenAPI v3 docs from code**
- [x] **Joi validated requests with nice errors**
- [x] **Swagger UI to view OpenAPI docs**, hosted on S3 as a static site ([example](http://openapi-joi-example-dev-swaggerui.s3-website-eu-west-1.amazonaws.com/))
- [x] Local development powered by serverless-offline
- [x] Knex migrations & query builder on PostgreSQL
- [x] Example CRUD API
- [x] Tests with jest
- [x] Travis CI configuration for serverless deployment
- [x] Typescript configuration with sensible defaults
- [x] Prettier + Tslint

## Quick Start

Requirements:
- Node.js v8+
- Local PostgreSQL (docker-compose file included)

```
source .env.sample# Set up environment variables
npm install
docker-compose up --detach # PostgreSQL listening at port 5432
npm run migrate # Set up database schema with knex migrations
npm run dev # Serverless offline: http://localhost:9000, Swagger UI: http://localhost:9001
```

## Example

Validation models are defined using Joi

```typescript
import Joi from 'joi';

const validation = {
  petId: Joi.number().integer()
    .description('Unique identifier for pet in database')
    .example(1)
    .label('PetId'),

  petPayload: Joi.object({
    name: Joi.string()
      .description('Name of the pet')
      .example('Garfield')
      .label('PetName'),
  }).label('PetPayload'),

  limit: Joi.number().integer().positive()
    .description('Number of items to return')
    .example(25)
    .label('QueryLimit'),

  offset: Joi.number().integer().min(0)
    .description('Starting offset for returning items')
    .example(0)
    .label('QueryOffset'),
};
```

Routes define API operations using validation rules for request body, path parameters, query parameters and headers.

```typescript
const routes = [
  {
    method: 'GET',
    path: '/pets',
    handler: getPets,
    summary: 'List pets',
    description: 'Returns all pets in database',
    tags: ['pets'],
    validation: {
      queryStringParameters: {
        limit: validation.limit,
        offset: validation.offset,
      },
    },
    responses: {
      200: { description: 'List of pets in database' },
    },
  },
  {
    method: 'GET',
    path: '/pets/{id}',
    handler: getPetById,
    summary: 'Get a pet by its id',
    description: 'Returns a pet by its id in database',
    tags: ['pets'],
    validation: {
      pathParameters: {
        id: validation.petId,
      },
    },
    responses: {
      200: { description: 'Pet object corresponding to id' },
      404: { description: 'Pet not found' },
    },
  },
  {
    method: 'POST',
    path: '/pets',
    handler: createPet,
    summary: 'Create pet',
    description: 'Crete a new pet into the database',
    tags: ['pets'],
    validation: {
      payload: validation.petPayload,
    },
    responses: {
      201: { description: 'Pet created succesfully' },
    },
  },
  {
    method: 'PATCH',
    path: '/pets/{id}',
    handler: updatePetById,
    summary: 'Update pet',
    description: 'Update an existing pet in the database',
    tags: ['pets'],
    validation: {
      pathParameters: {
        id: validation.petId,
      },
      payload: validation.petPayload,
    },
    responses: {
      200: { description: 'Pet updated succesfully' },
      404: { description: 'Pet not found' },
    },
  },
  {
    method: 'DELETE',
    path: '/pets/{id}',
    handler: deletePetById,
    summary: 'Delete a pet by its id',
    description: 'Deletes a pet by its id in database',
    tags: ['pets'],
    validation: {
      pathParameters: {
        id: validation.petId,
      },
    },
    responses: {
      200: { description: 'Pet deleted succesfully' },
      404: { description: 'Pet not found' },
    },
  },
];
```

OpenAPI v3 docs including JSON schema models are automatically generated for API, which can be viewed with tools like
Swagger UI. You can use either the generated static Swagger UI documentation page, or the `/swagger.json` endpoint.

![Swagger UI docs](swaggerui.png)

## Codebase

- `serverless.yml` – serverless config file, defines functions, endpoints and cloudformation resources
- `src/**` – typescript source files
  - `src/handler.ts` – serverless main entrypoint, this is where all http requests and function invocations start from
  - `src/routes.ts` – where api routes and validations are defined
  - `src/handler/**` – handlers for when routing is finished, this is where control logic happens
  - `src/core/**` – core business logic + reading & writing to database happens here
  - `src/util/**` – boring utilities like router logic and helpers are stored here
  - `src/types/**` – type definitions (.d.ts files)
  - `src/migrations/**` – knex database migration files (use `knex migrate:make` to create these)
  - `src/seeds/**` – knex database seed files (use `knex seeds:make` to create these)
- `dist/**` – transpiled javascript from source files
- `static/**` – generated static Swagger UI docs
- `scripts/**` – reusable scripts like for building static Swagger UI docs
- `__tests__/**` – jest tests

## Deploy

Make sure your AWS IAM access is set-up with sufficient privileges and access keys are set.
```
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
```

Full deploy with Serverless. (This will take some time on the first time)
```
npm run build # build project
serverless deploy --stage dev
```

In order to save time, you can also just deploy a single function and skip Cloudformation after first deploy is finished
```
serverless deploy function -f <function name> --stage dev
```
