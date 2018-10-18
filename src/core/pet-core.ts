import _ from 'lodash';
import { instance as knex } from '../util/knex';

export interface PetRow {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PetPayload {
  id?: number;
  name: string;
}

export interface ListOpts {
  limit?: number;
  offset?: number;
}

export async function getPet(id: number): Promise<PetRow> {
  const pets = await knex('pets')
    .where({ id })
    .select()
    .first();
  return pets;
}

export async function getAllPets(opts: ListOpts): Promise<PetRow[]> {
  const { limit, offset } = opts;
  const pets = await knex('pets')
    .limit(limit || 10)
    .offset(offset || 0)
    .select();
  return pets;
}

export async function insertPet(pet: PetPayload): Promise<PetRow> {
  const res = await knex('pets')
    .insert(pet)
    .returning('*');
  return _.first(res);
}

export async function updatePet(pet: PetPayload): Promise<PetRow> {
  const res = await knex('pets')
    .update(pet)
    .where({ id: pet.id })
    .returning('*');
  return _.first(res);
}

export async function deletePet(id: number): Promise<any> {
  const res = await knex('pets')
    .where({ id })
    .delete();
  return res;
}
