import { validate } from 'openapi-schema-validation';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { api } from '../src/handler';

interface ExtendedMatchers extends jest.Matchers<any> {
  toBeValidOpenAPI: (document?: any) => object;
}

expect.extend({
  toBeValidOpenAPI(received: any, version: number = 3) {
    const { valid, errors } = validate(received, version);
    return valid ? {
      pass: true,
      message: () => `Document is valid openapi v${version}`,
    } : {
      pass: false,
      message: () => `Document is not valid openapi v${version}, ${errors.length} validation errors:\n` +
        JSON.stringify(errors, null, 2),
    };
  },
});

describe('OpenAPI', () => {
  test('endpoint returns valid openapi json', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/swagger.json',
      headers: {},
    };
    const { body } = await api(event);
    const json = JSON.parse(body);
    (expect(json) as ExtendedMatchers).toBeValidOpenAPI();
  });
});
