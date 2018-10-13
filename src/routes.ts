import _ from 'lodash';
import Joi from 'joi';

import { Route } from './util/router';

import { getPets, getPetById, createPet, deletePetById } from './handler/pet-handler';

const auth = {
  'x-api-key': Joi.string().required(),
};

const routes: Route[] = [
  {
    method: 'GET',
    path: '/pets',
    operationId: 'getPets',
    handler: getPets,
    summary: 'List pets',
    description: 'Returns all pets in database',
    tags: ['api'],
    validation: {
      headers: { ...auth },
    },
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
      headers: { ...auth },
      pathParameters: {
        id: Joi.number()
          .integer()
          .required(),
      },
    },
  },
  {
    method: 'POST',
    path: '/pets',
    operationId: 'createPet',
    handler: createPet,
    summary: 'Create pet',
    description: 'Crete a new pet into the database',
    tags: ['api'],
    validation: {
      headers: { ...auth },
      payload: Joi.object({
        name: Joi.string().required(),
      }),
    },
  },
  {
    method: 'DELETE',
    path: '/pets/{id}',
    operationId: 'deletePetById',
    handler: deletePetById,
    summary: 'Delete a pet by its id',
    description: 'Deletes a pet by its id in database',
    tags: ['api'],
    validation: {
      headers: { ...auth },
      pathParameters: {
        id: Joi.number()
          .integer()
          .required(),
      },
    },
  },
];

export default routes;
