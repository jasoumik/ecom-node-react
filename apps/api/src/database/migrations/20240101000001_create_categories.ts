import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('image').nullable();
    table.uuid('parent_id').nullable().references('id').inTable('categories').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  await knex.schema.alterTable('products', (table) => {
    table.uuid('category_id').nullable().references('id').inTable('categories').onDelete('SET NULL');
  });
  
  // We will drop the 'category' column later or keep it for backward compatibility for a moment, 
  // but for clean architecture let's assume we migrate data or drop it. 
  // Since we are in dev and seeding, let's drop it to enforce relation.
  await knex.schema.alterTable('products', (table) => {
    table.dropColumn('category');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('products', (table) => {
    table.string('category').nullable();
    table.dropColumn('category_id');
  });
  await knex.schema.dropTableIfExists('categories');
}
