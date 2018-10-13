import * as Knex from 'knex';
import BPromise from 'bluebird';
import { upsert } from '../util/knex';
import { PetRow } from '../core/pet-core';

exports.seed = async (knex: Knex) => {
  const rows: PetRow[] = [
    {
      id: 1,
    },
  ];
  await BPromise.mapSeries(rows, (row) => upsert(knex, 'pets', row));
};
