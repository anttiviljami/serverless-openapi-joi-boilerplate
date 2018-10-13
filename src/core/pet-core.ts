import _ from 'lodash';
import { instance as knex } from '../util/knex';

export interface PetRow {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PetPayload {
  name: string;
}

export async function getPet(id: number): Promise<PetRow> {
  const pets = await knex('pets')
    .where({ id })
    .select()
    .first();
  return pets;
}

export async function getAllPets(): Promise<PetRow[]> {
  const pets = await knex('pets')
    .select();
  return pets;
}

export async function addPet(pet: PetPayload): Promise<PetRow> {
  const res = await knex('pets')
    .insert(pet)
    .returning('*');
  return _.first(res);
}

export async function deletePet(id: number): Promise<any> {
  const res = await knex('pets')
    .where({ id })
    .delete();
  return res;
}
