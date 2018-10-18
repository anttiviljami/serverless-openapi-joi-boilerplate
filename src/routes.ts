import _ from 'lodash';
import Joi from 'joi';
import { Route } from 'serverless-openapi-joi/handler';
import { getPets, getPetById, createPet, updatePetById, deletePetById } from './handler/pet-handler';

// validations
const validation = {
  petId: Joi.number().integer()
    .description('Unique identifier for pet in database')
    .example(1)
    .label('PetId'),

  petPayload: Joi.object({
    name: Joi.string()
      .description('Name of the pet')
      .example('Garfield')
      .label('PetName'),
  }).label('PetPayload'),

  limit: Joi.number().integer().positive()
    .description('Number of items to return')
    .example(25)
    .label('QueryLimit'),

  offset: Joi.number().integer().min(0)
    .description('Starting offset for returning items')
    .example(0)
    .label('QueryOffset'),
};

// tags can be either a simple string or a tag object
const tag = {
  pets: {
    name: 'pets',
    description: 'Pet operations',
  },
};

// api routes
const routes: Route[] = [
  {
    method: 'GET',
    path: '/pets',
    handler: getPets,
    summary: 'List pets',
    description: 'Returns all pets in database',
    tags: [tag.pets],
    validation: {
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
      payload: validation.petPayload,
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
      pathParameters: {
        id: validation.petId,
      },
      payload: validation.petPayload,
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
