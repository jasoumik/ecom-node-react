import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('order_items').del();
  await knex('orders').del();
  await knex('product_batches').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('users').del();
  await knex('banners').del();
  await knex('media_files').del();
  await knex('media_folders').del();

  // Create Admin User
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash('password', salt);

  await knex('users').insert([
    {
      phone: '01700000000', // Admin Phone
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
    },
    {
      phone: '01700000001', // Customer Phone
      email: 'customer@example.com',
      passwordHash, // Same password 'password'
      name: 'John Doe',
      role: 'customer',
    },
  ]);

  // Insert Categories
  const [diapers] = await knex('categories').insert({ name: 'Diapers & Wipes', image: 'https://picsum.photos/seed/diapers/800/800' }).returning('id');
  const [skincare] = await knex('categories').insert({ name: 'Skincare', image: 'https://picsum.photos/seed/skincare/800/800' }).returning('id');
  const [feeding] = await knex('categories').insert({ name: 'Feeding', image: 'https://picsum.photos/seed/feeding/800/800' }).returning('id');
  const [clothing] = await knex('categories').insert({ name: 'Clothing', image: 'https://picsum.photos/seed/clothing/800/800' }).returning('id');

  // Insert Products
  const products = [
    {
      name: 'Premium Soft Diapers (Pack of 80)',
      description: 'Ultra-soft, absorbent diapers for sensitive skin. Leak-proof protection for up to 12 hours.',
      price: 3200.00,
      old_price: 3500.00,
      cost_price: 2500.00,
      category_id: diapers.id,
      stock: 100,
      sku: 'DIA-001',
      images: JSON.stringify(['https://picsum.photos/seed/diaperpack/800/800']),
    },
    {
      name: 'Organic Baby Lotion',
      description: 'Gentle moisturizing lotion with aloe and chamomile. Keeps skin soft and hydrated.',
      price: 1800.00,
      cost_price: 1200.00,
      category_id: skincare.id,
      stock: 50,
      sku: 'SKIN-001',
      images: JSON.stringify(['https://picsum.photos/seed/lotion/800/800']),
    },
    {
      name: 'Silicone Feeding Set',
      description: 'BPA-free silicone bowl, spoon, and bib set. Suction base prevents spills.',
      price: 2800.00,
      old_price: 3200.00,
      cost_price: 2000.00,
      category_id: feeding.id,
      stock: 30,
      sku: 'FEED-001',
      images: JSON.stringify(['https://picsum.photos/seed/feedingset/800/800']),
    },
    {
      name: 'Organic Cotton Onesie Set (5-Pack)',
      description: 'Soft, breathable organic cotton onesies in pastel colors.',
      price: 2500.00,
      category_id: clothing.id,
      stock: 100,
      sku: 'CLOTH-001',
      images: JSON.stringify(['https://picsum.photos/seed/onesies/800/800']),
    },
  ];

  await knex('products').insert(products);

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
}
