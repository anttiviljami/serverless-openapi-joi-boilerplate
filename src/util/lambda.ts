import { HandlerResponse } from 'serverless-openapi-joi/handler';

export interface LambdaReplyOpts {
  statusCode?: number;
  headers?: {
    [header: string]: string;
  };
}

export function reply(result: any, opts: LambdaReplyOpts = {}): HandlerResponse {
  return {
    statusCode: opts.statusCode,
    headers: {
      ...opts.headers,
    },
    body: JSON.stringify(result),
  };
}
