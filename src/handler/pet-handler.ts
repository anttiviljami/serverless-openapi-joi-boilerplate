import _ from 'lodash';
import Boom from 'boom';
import { HandlerEvent, HandlerContext } from '../util/router';
import { getPet, getAllPets, insertPet, updatePet, deletePet } from '../core/pet-core';

export async function getPetById(event: HandlerEvent) {
  const { pathParameters } = event;
  const { id } = pathParameters;
  const pet = await getPet(Number(id));
  if (!pet) {
    throw Boom.notFound(`Pet id:${id} not found`);
  }
  return { result: pet };
}

export async function getPets(event: HandlerEvent) {
  const limit = Number(_.get(event.queryStringParameters, 'limit', '10'));
  const offset = Number(_.get(event.queryStringParameters, 'offset', '0'));
  const pets = await getAllPets({ limit, offset });
  return { result: pets };
}

export async function createPet(event: HandlerEvent, context: HandlerContext) {
  const { payload } = event;
  const pet = await insertPet(payload);
  context.statusCode = 201;
  return { result: pet };
}

export async function updatePetById(event: HandlerEvent) {
  const { pathParameters, payload } = event;
  const { id } = pathParameters;
  const pet = await updatePet({ id, ...payload });
  return { result: pet };
}

export async function deletePetById(event: HandlerEvent) {
  const { pathParameters } = event;
  const { id } = pathParameters;
  const result = await deletePet(Number(id));
  return { result };
}
