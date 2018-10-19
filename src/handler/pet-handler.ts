import _ from 'lodash';
import Boom from 'boom';
import { HandlerEvent } from 'serverless-openapi-joi/handler';
import { reply } from '../util/lambda';
import { getPet, getAllPets, insertPet, updatePet, deletePet } from '../core/pet-core';

export async function getPetById(event: HandlerEvent) {
  const { pathParameters } = event;
  const { id } = pathParameters;
  const pet = await getPet(Number(id));
  if (!pet) {
    throw Boom.notFound(`Pet id:${id} not found`);
  }
  return reply({ result: pet });
}

export async function getPets(event: HandlerEvent) {
  const limit = Number(_.get(event.queryStringParameters, 'limit', '10'));
  const offset = Number(_.get(event.queryStringParameters, 'offset', '0'));
  const pets = await getAllPets({ limit, offset });
  return reply({ result: pets });
}

export async function createPet(event: HandlerEvent) {
  const { payload } = event;
  const pet = await insertPet(payload);
  return reply({ result: pet }, { statusCode: 201 });
}

export async function updatePetById(event: HandlerEvent) {
  const { pathParameters, payload } = event;
  const { id } = pathParameters;
  const pet = await updatePet({ id, ...payload });
  return reply({ result: pet });
}

export async function deletePetById(event: HandlerEvent) {
  const { pathParameters } = event;
  const { id } = pathParameters;
  const result = await deletePet(Number(id));
  return reply({ result });
}
