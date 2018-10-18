import * as Knex from 'knex';
import BPromise from 'bluebird';
import { upsert } from '../util/knex';
import { PetRow } from '../core/pet-core';

exports.seed = async (knex: Knex) => {
  const rows: PetRow[] = [
    {
      id: 1,
      name: 'Onni',
    },
  ];
  await BPromise.mapSeries(rows, (row) => upsert(knex, 'pets', row));
  // reset sequence after upsert
  await knex.schema.raw(`select setval('pets_id_seq', (select max(id) from pets))`);
};
