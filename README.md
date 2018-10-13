# Serverless OpenAPI Joi Boilerplate Project
[![Build Status](https://travis-ci.org/anttiviljami/serverless-openapi-joi-boilerplate.svg?branch=master)](https://travis-ci.org/anttiviljami/serverless-openapi-joi-boilerplate) [![License](http://img.shields.io/:license-mit-blue.svg)](http://anttiviljami.mit-license.org)

Boilerplate serverless API project with generated OpenAPI docs (formerly known as swagger) from Joi validation.

Inspired by Hapi and [hapi-swagger](https://github.com/glennjones/hapi-swagger)

- [x] **Auto-generated OpenAPI docs from code** at endpoint `/swagger.json` (configurable)
- [x] **Joi validated requests**
- [x] Local development with serverless-offline + Docker
- [x] Knex migrations & query builder on PostgreSQL
- [x] Example CRUD API
- [x] Tests with jest
- [x] Local Swagger UI to view OpenAPI docs
- [x] Travis CI configuration for serverless deployment
- [x] Typescript configuration with sensible defaults
- [x] Prettier + Tslint

## Setup & Development

Requirements:
- Node.js v8+
- Docker (optional)

```
cp .env.sample .env # Set up environment variables
source .env
npm install
docker-compose up -d postgres swaggerui # Postgres online, Swagger UI listening at http://localhost:9001
npm run migrate # Set up database schema with knex migrations
npm run dev # Serverless offline listening at http://localhost:9000
```

## Deploy

Make sure your AWS IAM access is set-up with sufficient privileges and access keys are set.
```
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
```

Full deploy with Serverless. (This will take some time on the first time)
```
npm run build # build project
serverless deploy --stage dev # deploy stage
```

In order to save time, you can also just deploy a single function and skip Cloudformation after first deploy is finished
```
npm run pre-deploy
serverless deploy function -f <function name> --stage dev
```
