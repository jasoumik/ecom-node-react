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
    table.integer('points').defaultTo(0); // Added Points
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

  // Age Groups Table (Shop by Age)
  await knex.schema.createTable('age_groups', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('label').notNullable();
    table.string('label_bn').nullable();
    table.string('slug').unique().notNullable(); // Added Slug
    table.string('icon').notNullable();
    table.string('age_range').notNullable();
    table.string('description').nullable();
    table.string('description_bn').nullable();
    table.integer('sort_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.string('tenant_id').defaultTo('default');
    table.timestamps(true, true);
  });

  // Mother Categories Table
  await knex.schema.createTable('mother_categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('name_bn').nullable();
    table.string('slug').unique().notNullable();
    table.string('image').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('name_bn').nullable(); // Added Bangla Name
    table.string('slug').unique().notNullable(); // Added Slug
    table.text('description').nullable();
    table.text('description_bn').nullable(); // Added Bangla Description
    table.string('image').nullable();
    table.string('banner_image').nullable(); // Added Banner Image
    table.uuid('parent_id').nullable().references('id').inTable('categories').onDelete('CASCADE');
    table.uuid('age_group_id').nullable().references('id').inTable('age_groups').onDelete('SET NULL');
    table.uuid('mother_category_id').nullable().references('id').inTable('mother_categories').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Brands Table
  await knex.schema.createTable('brands', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('name_bn').nullable(); // Added Bangla Name
    table.string('slug').unique().notNullable(); // Added Slug
    table.string('logo').nullable();
    table.text('description').nullable();
    table.uuid('mother_category_id').nullable().references('id').inTable('mother_categories').onDelete('SET NULL');
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
    table.string('slug').unique().notNullable(); // Added Slug
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
    table.text('age_groups').nullable(); // Store age group IDs as comma-separated string
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

  // Labels Table - For product/banner/section labeling
  await knex.schema.createTable('labels', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('name_bn').nullable();
    table.string('slug').unique().notNullable();
    table.string('color').defaultTo('#3b82f6'); // Tailwind sky-500
    table.string('bg_color').defaultTo('#eff6ff'); // Tailwind sky-50
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Product Labels Junction Table
  await knex.schema.createTable('product_labels', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('label_id').notNullable().references('id').inTable('labels').onDelete('CASCADE');
    table.timestamps(true, true);
    table.unique(['product_id', 'label_id']);
  });

  // Coupons Table
  await knex.schema.createTable('coupons', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('code').unique().notNullable();
    table.string('name').nullable(); // Friendly name for the coupon
    table.string('description').nullable(); // Description for admin
    table.string('type').notNullable(); // 'percentage' or 'fixed'
    table.decimal('value', 10, 2).notNullable();
    table.decimal('min_order_amount', 10, 2).defaultTo(0);
    table.decimal('max_discount_amount', 10, 2).nullable(); // Cap for percentage discounts
    table.date('starts_at').nullable(); // Start date
    table.date('expires_at').nullable();
    table.boolean('no_expiry').defaultTo(false); // Flag for no expiry
    table.integer('usage_limit').nullable(); // Max number of total uses
    table.integer('usage_limit_per_user').nullable(); // Max uses per customer
    table.integer('times_used').defaultTo(0); // Track usage count
    table.specificType('applicable_categories', 'uuid[]').nullable(); // Array of category IDs
    table.specificType('applicable_products', 'uuid[]').nullable(); // Array of product IDs
    table.specificType('excluded_products', 'uuid[]').nullable(); // Array of excluded product IDs
    table.boolean('first_order_only').defaultTo(false); // Only for first-time customers
    table.boolean('free_shipping').defaultTo(false); // Include free shipping
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Bundles Table
  await knex.schema.createTable('bundles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title').notNullable();
    table.string('title_bn').nullable();
    table.string('slug').unique().notNullable(); // Added Slug
    table.text('description').nullable();
    table.text('description_bn').nullable();
    table.string('image').nullable();
    table.decimal('price', 10, 2).notNullable(); // The selling price of the bundle
    table.decimal('original_price', 10, 2).nullable(); // The sum of original prices (for showing discount)
    table.boolean('is_free_shipping').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Bundle Items Table
  await knex.schema.createTable('bundle_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('bundle_id').notNullable().references('id').inTable('bundles').onDelete('CASCADE');
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('SET NULL');
    table.integer('quantity').defaultTo(1);
    table.timestamps(true, true);
  });

  // Carts Table
  await knex.schema.createTable('carts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
    table.unique(['user_id']); // One cart per user
  });

  // Cart Items Table
  await knex.schema.createTable('cart_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('cart_id').notNullable().references('id').inTable('carts').onDelete('CASCADE');
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('CASCADE');
    table.integer('quantity').notNullable().defaultTo(1);
    table.timestamps(true, true);
    table.unique(['cart_id', 'product_id', 'variant_id']); // Unique item per cart
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
    table.string('payment_phone').nullable(); // Added payment phone
    table.string('order_source').defaultTo('Website'); // Facebook, Phone, WhatsApp, Website
    table.string('payment_status').defaultTo('Pending'); // Pending, Paid
    table.decimal('paid_amount', 10, 2).defaultTo(0); // Added paid amount
    table.boolean('is_gift').defaultTo(false); // Added Gift Flag
    table.text('gift_message').nullable(); // Added Gift Message
    table.integer('points_earned').defaultTo(0); // Added Points Earned
    table.integer('points_redeemed').defaultTo(0); // Added Points Redeemed
    table.decimal('points_discount', 10, 2).defaultTo(0); // Added Points Discount Amount
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('product_id').nullable().references('id').inTable('products').onDelete('SET NULL');
    table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('SET NULL'); // Track variant
    table.uuid('batch_id').nullable().references('id').inTable('product_batches').onDelete('SET NULL'); // Track which batch
    table.uuid('bundle_id').nullable().references('id').inTable('bundles').onDelete('SET NULL'); // Track bundle
    table.string('product_name').notNullable(); // Snapshot of product name
    table.string('variant_name').nullable(); // Snapshot of variant details (e.g. "Size: M, Color: Red")
    table.decimal('price', 10, 2).notNullable(); // Snapshot of price
    table.integer('quantity').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Payments Table
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.string('method').notNullable(); // cod, bkash, nagad, cash, etc.
    table.string('transaction_id').nullable();
    table.string('note').nullable();
    table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
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
    table.string('title_bn').nullable(); // Bangla Title
    table.string('image').notNullable();
    table.string('link').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('order').defaultTo(0);
    table.date('starts_at').nullable(); // Start date for banner
    table.date('expires_at').nullable(); // End date for banner
    table.boolean('no_expiry').defaultTo(true); // Flag for no expiry
    table.uuid('label_id').nullable().references('id').inTable('labels').onDelete('SET NULL'); // Associated label
    table.string('position').defaultTo('hero'); // hero, sidebar, popup, etc.
    table.string('target').defaultTo('_self'); // _self or _blank for links
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
    table.text('value').notNullable(); // Changed to TEXT
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
    table.uuid('order_id').nullable().references('id').inTable('orders').onDelete('CASCADE'); // Verify purchase, nullable for manual reviews
    table.integer('rating').notNullable(); // 1-5
    table.text('comment').nullable();
    table.jsonb('images').nullable(); // Array of image URLs
    table.string('status').defaultTo('pending'); // pending, approved, rejected
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Ensure one review per product per order (if order exists)
    table.unique(['product_id', 'order_id']);
  });

  // Wishlist Items Table
  await knex.schema.createTable('wishlist_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.unique(['user_id', 'product_id']);
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

  // Coupon Usage Tracking Table
  await knex.schema.createTable('coupon_usages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('coupon_id').notNullable().references('id').inTable('coupons').onDelete('CASCADE');
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.uuid('order_id').nullable().references('id').inTable('orders').onDelete('SET NULL');
    table.decimal('discount_amount', 10, 2).notNullable();
    table.timestamps(true, true);
  });

  // Email Templates Table
  await knex.schema.createTable('email_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').unique().notNullable(); // e.g., 'order_confirmation', 'welcome_email'
    table.string('subject').notNullable();
    table.text('body').notNullable(); // HTML content
    table.jsonb('variables').nullable(); // List of available variables for this template
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Email Logs Table
  await knex.schema.createTable('email_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('to').notNullable();
    table.string('subject').notNullable();
    table.text('body').notNullable();
    table.string('status').defaultTo('sent'); // sent, failed
    table.text('error').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // SMS Templates Table
  await knex.schema.createTable('sms_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').unique().notNullable(); // e.g., 'order_placed', 'verification_code'
    table.text('body').notNullable(); // SMS content
    table.jsonb('variables').nullable(); // List of available variables
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // SMS Logs Table
  await knex.schema.createTable('sms_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('to').notNullable();
    table.text('body').notNullable();
    table.string('status').defaultTo('sent'); // sent, failed
    table.text('error').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sms_logs');
  await knex.schema.dropTableIfExists('sms_templates');
  await knex.schema.dropTableIfExists('email_logs');
  await knex.schema.dropTableIfExists('email_templates');
  await knex.schema.dropTableIfExists('coupon_usages');
  await knex.schema.dropTableIfExists('order_history');
  await knex.schema.dropTableIfExists('landing_pages');
  await knex.schema.dropTableIfExists('promises');
  await knex.schema.dropTableIfExists('wishlist_items');
  await knex.schema.dropTableIfExists('reviews');
  await knex.schema.dropTableIfExists('contact_messages');
  await knex.schema.dropTableIfExists('product_requests');
  await knex.schema.dropTableIfExists('stock_requests');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('media_files');
  await knex.schema.dropTableIfExists('media_folders');
  await knex.schema.dropTableIfExists('banners');
  await knex.schema.dropTableIfExists('stock_movements');
  await knex.schema.dropTableIfExists('payments'); // Added
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('cart_items'); // Added
  await knex.schema.dropTableIfExists('carts'); // Added
  await knex.schema.dropTableIfExists('bundle_items');
  await knex.schema.dropTableIfExists('bundles');
  await knex.schema.dropTableIfExists('coupons');
  await knex.schema.dropTableIfExists('product_labels');
  await knex.schema.dropTableIfExists('labels');
  await knex.schema.dropTableIfExists('delivery_charges');
  await knex.schema.dropTableIfExists('product_batches');
  await knex.schema.dropTableIfExists('product_variants');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('countries');
  await knex.schema.dropTableIfExists('brands');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('mother_categories'); // Added
  await knex.schema.dropTableIfExists('age_groups');
  await knex.schema.dropTableIfExists('addresses');
  await knex.schema.dropTableIfExists('users');
}
