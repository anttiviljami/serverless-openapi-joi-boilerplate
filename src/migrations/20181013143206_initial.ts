import * as Knex from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('pets', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.timestamps(false, true); // created_at, updated_at
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('pets');
};
