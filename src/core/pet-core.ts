import { instance as knex } from '../util/knex';

export interface PetRow {
  id: number;
  created_at?: Date;
  updated_at?: Date;
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
