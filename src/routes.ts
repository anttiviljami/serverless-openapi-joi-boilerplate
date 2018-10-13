import _ from 'lodash';
import Joi from 'joi';

import { Route } from './util/router';

import { getPets } from './core/pet-core';

const routes: Route[] = [
  {
    method: 'GET',
    path: '/pets',
    operationId: 'getPets',
    summary: 'List pets',
    description: 'Returns all pets in database',
    handler: getPets,
    tags: ['api'],
  },
  {
    method: 'GET',
    path: '/pets/{id}',
    operationId: 'getPetById',
    summary: 'Get a pet by its id',
    description: 'Returns a pet by its id in database',
    handler: getPets,
    tags: ['api'],
    validation: {
      pathParameters: {
        id: Joi.number()
          .integer()
          .required(),
      },
    },
  },
];

export default routes;
