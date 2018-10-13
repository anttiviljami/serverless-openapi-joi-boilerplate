import 'source-map-support/register';
import { APIGatewayProxyEvent } from 'aws-lambda';
import Boom from 'boom';

import { routeEvent } from './util/router';
import { instance as knex } from './util/knex';
import { createLogger } from './util/logger';

import routes from './routes';

const logger = createLogger(__filename);

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-credentials': 'true',
};

export async function migrate() {
  const [num, files] = await knex.migrate.latest();
  const message = files.length
    ? `${files.length} migrations done:\n${files.join('\n')}`
    : `Already up to date at migration ${num}!`;
  logger.info(message);
  return { message };
}

export async function api(event: Partial<APIGatewayProxyEvent>): Promise<any> {
  try {
    const res = await routeEvent(event, routes);
    return {
      statusCode: 200,
      body: JSON.stringify(res),
      headers: {
        ...cors,
      },
    };
  } catch (err) {
    let boom;
    if (err.isBoom) {
      boom = err.output;
    } else {
      // unknown error
      logger.error(err);
      boom = Boom.badImplementation('Internal API error').output;
    }
    return {
      statusCode: boom.statusCode,
      body: JSON.stringify(boom.payload),
      headers: {
        ...cors,
      },
    };
  }
}
