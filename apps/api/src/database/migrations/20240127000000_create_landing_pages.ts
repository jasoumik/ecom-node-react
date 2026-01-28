import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('landing_pages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.string('slug').unique().notNullable();
    table.string('title');
    table.text('description');
    table.string('theme').defaultTo('default'); // default, dark, festive, etc.
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('landing_pages');
}
