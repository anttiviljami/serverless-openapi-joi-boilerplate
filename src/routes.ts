import _ from 'lodash';

import { Route } from './util/router';

import { getPets, getPetById, createPet, updatePetById, deletePetById } from './handler/pet-handler';
import validation from './validation';

const auth = {
  'x-api-key': validation.apiKey.required(),
};

// tags can be either a simple string or a tag object
const tag = {
  pets: {
    name: 'pets',
    description: 'Pet operations',
  },
};

const routes: Route[] = [
  {
    method: 'GET',
    path: '/pets',
    handler: getPets,
    summary: 'List pets',
    description: 'Returns all pets in database',
    tags: [tag.pets],
    validation: {
      headers: { ...auth },
      queryStringParameters: {
        limit: validation.limit,
        offset: validation.offset,
      },
    },
    responses: {
      200: { description: 'List of pets in database' },
    },
  },
  {
    method: 'GET',
    path: '/pets/{id}',
    handler: getPetById,
    summary: 'Get a pet by its id',
    description: 'Returns a pet by its id in database',
    tags: ['pets'],
    validation: {
      headers: { ...auth },
      pathParameters: {
        id: validation.petId,
      },
    },
    responses: {
      200: { description: 'Pet object corresponding to id' },
      404: { description: 'Pet not found' },
    },
  },
  {
    method: 'POST',
    path: '/pets',
    handler: createPet,
    summary: 'Create pet',
    description: 'Crete a new pet into the database',
    tags: ['pets'],
    validation: {
      headers: { ...auth },
      payload: validation.createPetPayload,
    },
    responses: {
      201: { description: 'Pet created succesfully' },
    },
  },
  {
    method: 'PATCH',
    path: '/pets/{id}',
    handler: updatePetById,
    summary: 'Update pet',
    description: 'Update an existing pet in the database',
    tags: ['pets'],
    validation: {
      headers: { ...auth },
      pathParameters: {
        id: validation.petId,
      },
      payload: validation.createPetPayload,
    },
    responses: {
      200: { description: 'Pet updated succesfully' },
      404: { description: 'Pet not found' },
    },
  },
  {
    method: 'DELETE',
    path: '/pets/{id}',
    handler: deletePetById,
    summary: 'Delete a pet by its id',
    description: 'Deletes a pet by its id in database',
    tags: ['pets'],
    validation: {
      headers: { ...auth },
      pathParameters: {
        id: validation.petId,
      },
    },
    responses: {
      200: { description: 'Pet deleted succesfully' },
      404: { description: 'Pet not found' },
    },
  },
];

export default routes;
