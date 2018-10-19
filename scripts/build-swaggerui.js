#!/usr/bin/env node
/**
 * scripts/build-swaggerui.js
 * 
 * This script builds Swagger UI under static/ and generates a swagger.json file containing the openapi spec. It can 
 * be triggered either by directly calling the script, or as a serverless post-deploy hook with serverless-stack-output
 */

const path = require('path');
const fs = require('fs');
const mime = require('mime');
const { S3 } = require('aws-sdk');
const { getAbsoluteFSPath } = require('swagger-ui-dist');
const { validate } = require('openapi-schema-validation');
const OpenAPIBuilder = require('serverless-openapi-joi/openapi').default;
const routes = require('../dist/routes').default;
const { info } = require('../dist/handler');

async function handler(data) {
  const { ServiceEndpoint, SwaggerUIBucketName } = data;

  const openapi = new OpenAPIBuilder({
    info,
    servers: [{ url: ServiceEndpoint }],
    routes,
  });

  // create static files directory if not exists
  const outputPath = SwaggerUIBucketName ?
    path.join(__dirname, '..', '.serverless-static') : path.join(__dirname, '..', 'static');
  fs.existsSync(outputPath) || fs.mkdirSync(outputPath);

  // generate swagger.json
  const apispec = openapi.getDefinition(routes, ServiceEndpoint);

  // validate openapi and warn in case there are issues
  const { valid, errors } = validate(apispec, 3);
  if (valid) {
    console.info('\x1b[32m[success]\x1b[0m Document is valid OpenAPI v3!');
  } else {
    console.warn(`\x1b[33m[warning]\x1b[0m Document is not valid OpenAPI!\n ${errors.length} validation errors:\n` +
      JSON.stringify(errors, null, 2));
  }

  // write to swagger.json file under static/
  const swaggerFile = path.join(outputPath, 'swagger.json');
  fs.writeFileSync(swaggerFile, JSON.stringify(apispec));
  console.info(`[info] Wrote OpenAPI spec to ${path.basename(outputPath)}/${path.basename(swaggerFile)}`);

  // copy swagger ui dist files
  const swaggerDist = getAbsoluteFSPath();
  const swaggerFiles = fs.readdirSync(swaggerDist)
    .filter(file => !file.endsWith('.map'));
  for (const file of swaggerFiles) {
    const source = path.join(swaggerDist, file);
    const target = path.join(outputPath, file);
    fs.writeFileSync(target, fs.readFileSync(source));
  }
  console.info(`[info] Copied ${swaggerFiles.length} SwaggerUI files to ${path.basename(outputPath)}/`);

  // replace api url to relative ./swagger.json in index.html
  const index = fs.readFileSync(path.join(swaggerDist, 'index.html'));
  const replaced = index.toString()
    .replace(new RegExp('https://petstore.swagger.io/v2/swagger.json', 'g'), './swagger.json')
    .replace(new RegExp('http://example.com/api', 'g'), './swagger.json')
  fs.writeFileSync(path.join(outputPath, 'index.html'), replaced);
  console.info(`[info] Replaced index.html swagger url with relative swagger.json`);

  // sync static folder to S3, if bucket name is specified
  if (SwaggerUIBucketName) {
    console.info(`[info] Uploading Swagger UI files to S3 bucket ${SwaggerUIBucketName}...`);
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const uploadFiles = fs.readdirSync(outputPath);
    for (const file of uploadFiles) {
      console.info(`[info] Uploading file ${file}...`);
      const filePath = path.join(outputPath, file);
      await s3.putObject({
        Bucket: SwaggerUIBucketName,
        ACL: 'public-read',
        Key: file,
        Body: fs.readFileSync(filePath),
        ContentType: mime.getType(file),
      }).promise();
      // clean up file after upload
      fs.unlinkSync(filePath)
    }
    // clean up directory after upload
    fs.rmdirSync(outputPath);
  } else {
    console.info('[info] No S3 bucket supplied. Skipping static file upload.');
  }

  console.info('\x1b[32m[success]\x1b[0m Finished!');
  return true;
}

if (require.main === module) {
  try {
    handler({ ServiceEndpoint: process.env.BASEURL });
  } catch (err) {
    console.error('\x1b[31m[error]\x1b[0m', err);
  }
}

module.exports = { handler };
