import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('customer_name').notNullable();
    table.string('customer_phone').notNullable();
    table.string('customer_address').notNullable();
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('status').defaultTo('pending'); // pending, processing, shipped, delivered, cancelled
    table.timestamps(true, true);
  });

  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('product_id').nullable().references('id').inTable('products').onDelete('SET NULL');
    table.string('product_name').notNullable(); // Snapshot of product name
    table.decimal('price', 10, 2).notNullable(); // Snapshot of price
    table.integer('quantity').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
}
