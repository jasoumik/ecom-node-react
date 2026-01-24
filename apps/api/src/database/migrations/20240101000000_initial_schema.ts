import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension if not exists (for older Postgres)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('phone').unique().notNullable(); // Phone is primary identifier
    table.string('email').unique().nullable(); // Email is optional
    table.string('passwordHash').notNullable();
    table.string('name').notNullable();
    table.string('role').defaultTo('customer');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('image').nullable();
    table.uuid('parent_id').nullable().references('id').inTable('categories').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.decimal('price', 10, 2).notNullable(); // Current selling price
    table.decimal('old_price', 10, 2).nullable(); // Old price for strikethrough
    table.decimal('cost_price', 10, 2).nullable(); // Cost price for profit calc
    table.jsonb('images').nullable();
    table.uuid('category_id').nullable().references('id').inTable('categories').onDelete('SET NULL');
    table.integer('stock').defaultTo(0);
    table.string('sku').unique().nullable(); // Stock Keeping Unit
    table.timestamps(true, true);
  });

  // Product Batches for Inventory Management
  await knex.schema.createTable('product_batches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.string('batch_number').notNullable();
    table.decimal('purchase_price', 10, 2).notNullable();
    table.decimal('selling_price', 10, 2).notNullable(); // Price for this batch
    table.integer('quantity').notNullable();
    table.integer('remaining_quantity').notNullable();
    table.date('expiry_date').nullable();
    table.date('purchase_date').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });

  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.increments('order_number').unique().notNullable(); // Auto-incrementing numeric ID for display
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
    table.uuid('batch_id').nullable().references('id').inTable('product_batches').onDelete('SET NULL'); // Track which batch
    table.string('product_name').notNullable(); // Snapshot of product name
    table.decimal('price', 10, 2).notNullable(); // Snapshot of price
    table.integer('quantity').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('product_batches');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
}
