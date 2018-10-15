import _ from 'lodash';

import { Route } from './util/router';

import { getPets, getPetById, createPet, deletePetById } from './handler/pet-handler';
import validation from './validation';

const auth = {
  'x-api-key': validation.apiKey.required(),
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
      queryStringParameters: {
        limit: validation.limit,
        offset: validation.offset,
      },
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
        id: validation.petId,
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
      payload: validation.createPetPayload,
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
        id: validation.petId,
      },
    },
  },
];

export default routes;
