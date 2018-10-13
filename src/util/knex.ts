import Knex from 'knex';
import * as _ from 'lodash';

interface Timestamps {
  created_at?: any;
  updated_at?: any;
}

export const instance = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './dist/migrations',
    tableName: 'migrations',
  },
  seeds: {
    directory: './dist/seeds',
  },
});

// A really slow upsert implementation. Knex can't do upsert :(
export async function upsert(knex: Knex, table: string, row: any, key: any = 'id') {
  const whereClause: any = typeof key === 'string' ? { [key]: row[key] } : _.pick(row, key);
  const rows = _.identity(whereClause[key])
    ? await knex(table)
        .select()
        .where(whereClause)
    : [];
  if (rows.length > 0) {
    const timestamps: Timestamps = {};
    if (!row.updated_at && rows[0].updated_at) {
      // update timestamp
      timestamps.updated_at = knex.fn.now();
    }
    return knex(table)
      .where(whereClause)
      .update({
        ...row,
        ...timestamps,
      })
      .returning('*');
  }
  return knex(table)
    .insert(row)
    .returning('*');
}
