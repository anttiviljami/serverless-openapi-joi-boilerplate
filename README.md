# Serverless OpenAPI Joi Boilerplate Project
[![Build Status](https://travis-ci.org/anttiviljami/serverless-openapi-joi-boilerplate.svg?branch=master)](https://travis-ci.org/anttiviljami/serverless-openapi-joi-boilerplate) [![License](http://img.shields.io/:license-mit-blue.svg)](http://anttiviljami.mit-license.org)

Boilerplate serverless API project using [serverless-openapi-joi](https://github.com/anttiviljami/serverless-openapi-joi) plugin

- [x] **Auto-generated OpenAPI v3 docs from code**
- [x] **Joi validated requests with nice errors**
- [x] **Swagger UI to view OpenAPI docs**, hosted on S3 as a static site ([example](http://openapi-joi-example-dev-swaggerui.s3-website-eu-west-1.amazonaws.com/))
- [x] Example CRUD API
- [x] Local development powered by serverless-offline
- [x] Knex migrations & query builder on PostgreSQL
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

## Codebase

- `serverless.yml` – serverless config file, defines functions, endpoints and cloudformation resources
- `src/**` – typescript source files
  - `src/handler.ts` – serverless main entrypoint, this is where all http requests and function invocations start from
  - `src/routes.ts` – where api routes and validations are defined
  - `src/api.ts` - api metadata (title, description, version)
  - `src/handler/**` – handlers for when routing is finished, this is where control logic happens
  - `src/core/**` – core business logic + reading & writing to database happens here
  - `src/util/**` – boring utilities and helpers are stored here
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
