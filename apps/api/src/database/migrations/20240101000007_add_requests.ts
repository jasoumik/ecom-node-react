import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Stock Requests (Notify Me)
  await knex.schema.createTable('stock_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('CASCADE');
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('email').nullable();
    table.string('phone').notNullable(); // Phone is mandatory for notifications usually
    table.string('status').defaultTo('pending'); // pending, notified
    table.timestamps(true, true);
  });

  // Product Requests (New Product Ideas)
  await knex.schema.createTable('product_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('product_name').notNullable();
    table.text('description').nullable();
    table.string('user_name').notNullable();
    table.string('phone').notNullable();
    table.string('email').nullable();
    table.string('status').defaultTo('pending'); // pending, fulfilled, rejected
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('product_requests');
  await knex.schema.dropTableIfExists('stock_requests');
}
