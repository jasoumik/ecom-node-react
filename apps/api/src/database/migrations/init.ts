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
    table.string('avatar').nullable(); // Profile picture
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('addresses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type').notNullable(); // Home, Office, etc.
    table.string('address').notNullable();
    table.string('city').nullable();
    table.string('zip').nullable();
    table.boolean('is_default').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('name_bn').nullable(); // Added Bangla Name
    table.text('description').nullable();
    table.text('description_bn').nullable(); // Added Bangla Description
    table.string('image').nullable();
    table.uuid('parent_id').nullable().references('id').inTable('categories').onDelete('CASCADE');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Brands Table
  await knex.schema.createTable('brands', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('name_bn').nullable(); // Added Bangla Name
    table.string('logo').nullable();
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Countries Table
  await knex.schema.createTable('countries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('name_bn').nullable(); // Added Bangla Name
    table.string('code').notNullable(); // ISO code e.g. BD, US
    table.string('flag').nullable(); // URL to flag image
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('name_bn').nullable(); // Added Bangla Name
    table.text('description').notNullable();
    table.text('description_bn').nullable(); // Added Bangla Description
    table.decimal('price', 10, 2).notNullable(); // Current selling price
    table.decimal('old_price', 10, 2).nullable(); // Old price for strikethrough
    table.decimal('cost_price', 10, 2).nullable(); // Cost price for profit calc
    table.jsonb('images').nullable();
    table.uuid('category_id').nullable().references('id').inTable('categories').onDelete('SET NULL');
    table.uuid('brand_id').nullable().references('id').inTable('brands').onDelete('SET NULL'); // Brand is optional
    table.uuid('country_id').nullable().references('id').inTable('countries').onDelete('SET NULL'); // Country of Origin
    table.integer('stock').defaultTo(0);
    table.string('sku').unique().nullable(); // Stock Keeping Unit
    // Base attributes (can be used if no variants)
    table.string('size').nullable();
    table.string('weight').nullable();
    table.string('color').nullable();
    table.string('material').nullable();
    table.boolean('has_variants').defaultTo(false); // Flag to check if we should look at variants table
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Product Variants Table
  await knex.schema.createTable('product_variants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.string('size').nullable();
    table.string('color').nullable();
    table.string('material').nullable();
    table.string('weight').nullable();
    table.decimal('price', 10, 2).nullable(); // Override base price
    table.integer('stock').defaultTo(0);
    table.string('sku').unique().nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Product Batches for Inventory Management
  await knex.schema.createTable('product_batches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('CASCADE'); // Optional link to variant
    table.string('batch_number').notNullable();
    table.decimal('purchase_price', 10, 2).notNullable();
    table.decimal('selling_price', 10, 2).notNullable(); // Price for this batch
    table.integer('quantity').notNullable();
    table.integer('remaining_quantity').notNullable();
    table.date('expiry_date').nullable();
    table.date('purchase_date').defaultTo(knex.fn.now());
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Delivery Charges Table
  await knex.schema.createTable('delivery_charges', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable(); // e.g. Inside Dhaka
    table.string('name_bn').nullable(); // Added Bangla Name
    table.decimal('amount', 10, 2).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Coupons Table
  await knex.schema.createTable('coupons', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('code').unique().notNullable();
    table.string('type').notNullable(); // 'percentage' or 'fixed'
    table.decimal('value', 10, 2).notNullable();
    table.decimal('min_order_amount', 10, 2).defaultTo(0);
    table.date('expires_at').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.increments('order_number').unique().notNullable(); // Auto-incrementing numeric ID for display
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('customer_name').notNullable();
    table.string('customer_phone').notNullable();
    table.string('customer_address').notNullable();
    table.decimal('subtotal', 10, 2).notNullable(); // Items total
    table.decimal('delivery_charge', 10, 2).defaultTo(0);
    table.decimal('discount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable(); // Final total
    table.string('status').defaultTo('pending'); // pending, processing, shipped, delivered, cancelled
    table.uuid('coupon_id').nullable().references('id').inTable('coupons').onDelete('SET NULL');
    table.string('payment_method').defaultTo('cod'); // cod, bkash, nagad
    table.string('transaction_id').nullable(); // For bkash/nagad
    table.string('order_source').defaultTo('Website'); // Facebook, Phone, WhatsApp, Website
    table.string('payment_status').defaultTo('Pending'); // Pending, Paid
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('product_id').nullable().references('id').inTable('products').onDelete('SET NULL');
    table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('SET NULL'); // Track variant
    table.uuid('batch_id').nullable().references('id').inTable('product_batches').onDelete('SET NULL'); // Track which batch
    table.string('product_name').notNullable(); // Snapshot of product name
    table.string('variant_name').nullable(); // Snapshot of variant details (e.g. "Size: M, Color: Red")
    table.decimal('price', 10, 2).notNullable(); // Snapshot of price
    table.integer('quantity').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Stock Movements Table
  await knex.schema.createTable('stock_movements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('CASCADE');
    table.integer('quantity_change').notNullable(); // Positive for stock in, negative for stock out
    table.string('type').notNullable(); // e.g., 'sale', 'cancellation_restock', 'return_restock', 'batch_purchase', 'manual_adjustment'
    table.text('reason').nullable();
    table.uuid('order_id').nullable().references('id').inTable('orders').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // Banners Table
  await knex.schema.createTable('banners', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title').notNullable();
    table.string('title_bn').nullable(); // Added Bangla Title
    table.string('image').notNullable();
    table.string('link').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('order').defaultTo(0);
    table.timestamps(true, true);
  });

  // Media Folders Table
  await knex.schema.createTable('media_folders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.uuid('parent_id').nullable().references('id').inTable('media_folders').onDelete('CASCADE');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Media Files Table
  await knex.schema.createTable('media_files', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('url').notNullable();
    table.string('type').notNullable(); // image, video, etc.
    table.string('mime_type').notNullable();
    table.integer('size').notNullable(); // in bytes
    table.uuid('folder_id').nullable().references('id').inTable('media_folders').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Settings Table
  await knex.schema.createTable('settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('key').unique().notNullable();
    table.string('value').notNullable();
    table.string('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

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

  // Contact Messages
  await knex.schema.createTable('contact_messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('subject').notNullable();
    table.text('message').notNullable();
    table.string('status').defaultTo('unread'); // unread, read, replied
    table.timestamps(true, true);
  });

  // Reviews Table
  await knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE'); // Verify purchase
    table.integer('rating').notNullable(); // 1-5
    table.text('comment').nullable();
    table.jsonb('images').nullable(); // Array of image URLs
    table.string('status').defaultTo('pending'); // pending, approved, rejected
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Ensure one review per product per order
    table.unique(['product_id', 'order_id']);
  });

  // Promises Table (Why Choose Us)
  await knex.schema.createTable('promises', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title').notNullable();
    table.string('title_bn').nullable(); // Added Bangla Title
    table.text('description').notNullable();
    table.text('description_bn').nullable(); // Added Bangla Description
    table.string('icon').notNullable(); // Emoji or URL
    table.integer('order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Landing Pages Table
  await knex.schema.createTable('landing_pages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.string('slug').unique().notNullable();
    table.string('title');
    table.text('description');
    table.string('theme').defaultTo('default'); // default, dark, festive, etc.
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Order History Table
  await knex.schema.createTable('order_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.string('status').notNullable();
    table.string('comment').nullable();
    table.uuid('updated_by').nullable(); // User ID of admin who updated
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_history');
  await knex.schema.dropTableIfExists('landing_pages');
  await knex.schema.dropTableIfExists('promises');
  await knex.schema.dropTableIfExists('reviews');
  await knex.schema.dropTableIfExists('contact_messages');
  await knex.schema.dropTableIfExists('product_requests');
  await knex.schema.dropTableIfExists('stock_requests');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('media_files');
  await knex.schema.dropTableIfExists('media_folders');
  await knex.schema.dropTableIfExists('banners');
  await knex.schema.dropTableIfExists('stock_movements');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('coupons');
  await knex.schema.dropTableIfExists('delivery_charges');
  await knex.schema.dropTableIfExists('product_batches');
  await knex.schema.dropTableIfExists('product_variants');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('countries');
  await knex.schema.dropTableIfExists('brands');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('addresses');
  await knex.schema.dropTableIfExists('users');
}
