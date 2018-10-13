import Boom from 'boom';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPet, getAllPets } from '../core/pet-core';

export async function getPetById(event: Partial<APIGatewayProxyEvent>) {
  const { pathParameters } = event;
  const { id } = pathParameters;
  const pet = await getPet(Number(id));
  if (!pet) {
    throw Boom.notFound(`Pet id:${id} not found`);
  }
  return { result: pet };
}

export async function getPets(event: Partial<APIGatewayProxyEvent>) {
  const pets = await getAllPets();
  return { result: pets };
}
