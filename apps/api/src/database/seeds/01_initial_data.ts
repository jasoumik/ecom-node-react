import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('promises').del();
  await knex('reviews').del();
  await knex('contact_messages').del();
  await knex('product_requests').del();
  await knex('stock_requests').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('product_batches').del();
  await knex('product_variants').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('users').del();
  await knex('banners').del();
  await knex('media_files').del();
  await knex('media_folders').del();
  await knex('delivery_charges').del();
  await knex('coupons').del();
  await knex('brands').del();
  await knex('settings').del();
  await knex('countries').del();

  // Create Admin User
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash('password', salt);

  const [admin] = await knex('users').insert([
    {
      phone: '01700000000', // Admin Phone
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
    }
  ]).returning('id');

  const [customer] = await knex('users').insert([
    {
      phone: '01700000001', // Customer Phone
      email: 'customer@example.com',
      passwordHash, // Same password 'password'
      name: 'John Doe',
      role: 'customer',
    }
  ]).returning('id');

  // Insert Categories
  const [diapers] = await knex('categories').insert({ name: 'Diapers & Wipes', image: 'https://picsum.photos/seed/diapers/800/800' }).returning('id');
  const [skincare] = await knex('categories').insert({ name: 'Skincare', image: 'https://picsum.photos/seed/skincare/800/800' }).returning('id');
  const [feeding] = await knex('categories').insert({ name: 'Feeding', image: 'https://picsum.photos/seed/feeding/800/800' }).returning('id');
  const [clothing] = await knex('categories').insert({ name: 'Clothing', image: 'https://picsum.photos/seed/clothing/800/800' }).returning('id');

  // Insert Brands
  const [huggies] = await knex('brands').insert({ name: 'Huggies', logo: 'https://picsum.photos/seed/huggies/200/200' }).returning('id');
  const [johnsons] = await knex('brands').insert({ name: 'Johnsons', logo: 'https://picsum.photos/seed/johnsons/200/200' }).returning('id');

  // Insert Countries
  const [bangladesh] = await knex('countries').insert({ name: 'Bangladesh', code: 'BD' }).returning('id');
  const [usa] = await knex('countries').insert({ name: 'United States', code: 'US' }).returning('id');

  // Insert Products with Variants
  const productsData = [
    {
      name: 'Premium Soft Diapers',
      description: 'Ultra-soft, absorbent diapers for sensitive skin. Leak-proof protection for up to 12 hours.',
      price: 3200.00,
      old_price: 3500.00,
      cost_price: 2500.00,
      category_id: diapers.id,
      brand_id: huggies.id,
      country_id: usa.id,
      stock: 150, // Total stock
      sku: 'DIA-BASE',
      has_variants: true,
      images: JSON.stringify(['https://picsum.photos/seed/diaperpack/800/800']),
    },
    {
      name: 'Organic Cotton Onesie Set',
      description: 'Soft, breathable organic cotton onesies in pastel colors.',
      price: 2500.00,
      category_id: clothing.id,
      country_id: bangladesh.id,
      stock: 60, // Total stock
      sku: 'CLOTH-BASE',
      has_variants: true,
      images: JSON.stringify(['https://picsum.photos/seed/onesies/800/800']),
    },
    {
      name: 'Organic Baby Lotion',
      description: 'Gentle moisturizing lotion with aloe and chamomile. Keeps skin soft and hydrated.',
      price: 1800.00,
      cost_price: 1200.00,
      category_id: skincare.id,
      brand_id: johnsons.id,
      country_id: usa.id,
      stock: 100,
      sku: 'SKIN-BASE',
      has_variants: true,
      images: JSON.stringify(['https://picsum.photos/seed/lotion/800/800']),
    },
    {
      name: 'Silicone Feeding Set',
      description: 'BPA-free silicone bowl, spoon, and bib set. Suction base prevents spills.',
      price: 2800.00,
      old_price: 3200.00,
      cost_price: 2000.00,
      category_id: feeding.id,
      country_id: bangladesh.id,
      stock: 90,
      sku: 'FEED-BASE',
      has_variants: true,
      images: JSON.stringify(['https://picsum.photos/seed/feedingset/800/800']),
    },
  ];

  const [diaperProduct] = await knex('products').insert(productsData[0]).returning('id');
  const [onesieProduct] = await knex('products').insert(productsData[1]).returning('id');
  const [lotionProduct] = await knex('products').insert(productsData[2]).returning('id');
  const [feedingProduct] = await knex('products').insert(productsData[3]).returning('id');

  // Insert Variants for Diapers
  await knex('product_variants').insert([
    { product_id: diaperProduct.id, size: 'S', weight: '3-6kg', price: 3000.00, stock: 50, sku: 'DIA-S' },
    { product_id: diaperProduct.id, size: 'M', weight: '6-9kg', price: 3200.00, stock: 50, sku: 'DIA-M' },
    { product_id: diaperProduct.id, size: 'L', weight: '9-12kg', price: 3400.00, stock: 50, sku: 'DIA-L' },
  ]);

  // Insert Variants for Onesies
  await knex('product_variants').insert([
    { product_id: onesieProduct.id, size: '0-3M', color: 'Blue', material: 'Cotton', stock: 20, sku: 'CLOTH-BLUE-03' },
    { product_id: onesieProduct.id, size: '3-6M', color: 'Blue', material: 'Cotton', stock: 20, sku: 'CLOTH-BLUE-36' },
    { product_id: onesieProduct.id, size: '0-3M', color: 'Pink', material: 'Cotton', stock: 10, sku: 'CLOTH-PINK-03' },
    { product_id: onesieProduct.id, size: '3-6M', color: 'Pink', material: 'Cotton', stock: 10, sku: 'CLOTH-PINK-36' },
  ]);

  // Insert Variants for Lotion
  await knex('product_variants').insert([
    { product_id: lotionProduct.id, size: '100ml', weight: '120g', price: 1000.00, stock: 50, sku: 'SKIN-100' },
    { product_id: lotionProduct.id, size: '200ml', weight: '250g', price: 1800.00, stock: 50, sku: 'SKIN-200' },
  ]);

  // Insert Variants for Feeding Set
  await knex('product_variants').insert([
    { product_id: feedingProduct.id, color: 'Blue', material: 'Silicone', stock: 30, sku: 'FEED-BLUE' },
    { product_id: feedingProduct.id, color: 'Pink', material: 'Silicone', stock: 30, sku: 'FEED-PINK' },
    { product_id: feedingProduct.id, color: 'Green', material: 'Silicone', stock: 30, sku: 'FEED-GREEN' },
  ]);

  // Insert Banners
  await knex('banners').insert([
    {
      title: 'Summer Sale',
      image: 'https://picsum.photos/seed/banner1/1200/400',
      link: '/products',
      is_active: true,
      order: 1,
    },
    {
      title: 'New Arrivals',
      image: 'https://picsum.photos/seed/banner2/1200/400',
      link: '/products?sort=new',
      is_active: true,
      order: 2,
    },
  ]);

  // Insert Delivery Charges
  await knex('delivery_charges').insert([
    { name: 'Inside Dhaka', amount: 60.00 },
    { name: 'Outside Dhaka Metro', amount: 100.00 },
    { name: 'Outside Dhaka', amount: 130.00 },
  ]);

  // Insert Coupons
  await knex('coupons').insert([
    { code: 'WELCOME20', type: 'percentage', value: 20.00, min_order_amount: 1000.00, expires_at: '2025-12-31' },
    { code: 'FLAT100', type: 'fixed', value: 100.00, min_order_amount: 2000.00, expires_at: '2025-12-31' },
  ]);

  // Insert Settings
  await knex('settings').insert([
    {
      key: 'inventory_method',
      value: 'FIFO',
      description: 'Inventory valuation method: FIFO or LIFO',
    },
    {
      key: 'bkash_number',
      value: '01700000000',
      description: 'Bkash Merchant/Personal Number',
    },
    {
      key: 'nagad_number',
      value: '01700000000',
      description: 'Nagad Merchant/Personal Number',
    }
  ]);

  // Insert Promises
  await knex('promises').insert([
    {
      title: 'Expertly Curated',
      description: 'Every product is vetted by pediatricians and moms.',
      icon: '🛡️',
      order: 1
    },
    {
      title: 'Same-Day Delivery',
      description: 'Order by 2PM and get it today. Because babies can\'t wait.',
      icon: '🌱',
      order: 2
    },
    {
      title: '24/7 Parent Support',
      description: 'Questions? Chat with our experts anytime.',
      icon: '🤝',
      order: 3
    }
  ]);

  // Create a dummy order for review
  const [order] = await knex('orders').insert({
      user_id: customer.id,
      customer_name: 'John Doe',
      customer_phone: '01700000001',
      customer_address: 'Dhaka',
      subtotal: 3200,
      total_amount: 3260,
      status: 'delivered',
      payment_status: 'Paid'
  }).returning('id');

  // Insert Reviews
  await knex('reviews').insert([
      {
          product_id: diaperProduct.id,
          user_id: customer.id,
          order_id: order.id,
          rating: 5,
          comment: 'Prithibee is a lifesaver! The diaper subscription saves me so much time.',
          status: 'approved',
          created_at: new Date()
      },
      {
          product_id: lotionProduct.id,
          user_id: customer.id,
          order_id: order.id, // Reusing same order for simplicity in seed
          rating: 5,
          comment: 'Best selection of organic baby food I\'ve found online.',
          status: 'approved',
          created_at: new Date()
      },
      {
          product_id: feedingProduct.id,
          user_id: customer.id,
          order_id: order.id,
          rating: 5,
          comment: 'Fast delivery and amazing customer service. Highly recommend!',
          status: 'approved',
          created_at: new Date()
      }
  ]);
}
