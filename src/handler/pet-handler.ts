import Boom from 'boom';
import { HandlerContext } from '../util/router';
import { getPet, getAllPets, addPet, deletePet } from '../core/pet-core';

export async function getPetById(event: HandlerContext) {
  const { pathParameters } = event;
  const { id } = pathParameters;
  const pet = await getPet(Number(id));
  if (!pet) {
    throw Boom.notFound(`Pet id:${id} not found`);
  }
  return { result: pet };
}

export async function getPets(event: HandlerContext) {
  const pets = await getAllPets();
  return { result: pets };
}

export async function createPet(event: HandlerContext) {
  const { payload } = event;
  const pet = await addPet(payload);
  return { result: pet };
}

export async function deletePetById(event: HandlerContext) {
  const { pathParameters } = event;
  const { id } = pathParameters;
  const result = await deletePet(Number(id));
  return { result };
}
