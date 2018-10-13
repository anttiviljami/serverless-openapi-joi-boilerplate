import { instance as knex } from '../util/knex';

export interface PetRow {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

export async function getPets(): Promise<PetRow> {
  const pets = await knex('pets')
    .select();
  return pets;
}
