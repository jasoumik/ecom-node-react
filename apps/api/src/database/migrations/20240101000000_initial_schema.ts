import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension if not exists (for older Postgres)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').unique().notNullable();
    table.string('passwordHash').notNullable();
    table.string('name').notNullable();
    table.string('role').defaultTo('customer');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.jsonb('images').nullable();
    table.string('category').notNullable();
    table.integer('stock').defaultTo(0);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('users');
}
