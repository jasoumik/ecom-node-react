import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('order_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.string('status').notNullable();
    table.string('comment').nullable();
    table.uuid('updated_by').nullable(); // User ID of admin who updated
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('order_history');
}
