import { APIGatewayProxyEvent } from 'aws-lambda';
import { SchemaLike } from 'joi';

export interface Route {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  validation?: {
    headers?: SchemaLike;
    payload?: SchemaLike;
    pathParameters?: SchemaLike;
    queryStringParameters?: SchemaLike;
  };
  handler: (event: Partial<APIGatewayProxyEvent>) => Promise<any>;
}
