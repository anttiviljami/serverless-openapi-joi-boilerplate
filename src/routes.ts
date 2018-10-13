import _ from 'lodash';
import Joi from 'joi';

import { Route } from './util/router';

import { getPets, getPetById } from './handler/pet-handler';

const routes: Route[] = [
  {
    method: 'GET',
    path: '/pets',
    operationId: 'getPets',
    handler: getPets,
    summary: 'List pets',
    description: 'Returns all pets in database',
    tags: ['api'],
  },
  {
    method: 'GET',
    path: '/pets/{id}',
    operationId: 'getPetById',
    handler: getPetById,
    summary: 'Get a pet by its id',
    description: 'Returns a pet by its id in database',
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
