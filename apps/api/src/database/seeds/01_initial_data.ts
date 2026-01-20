import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('products').del();
  await knex('users').del();

  // Create Admin User
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash('password', salt);

  await knex('users').insert([
    {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
    },
    {
      email: 'customer@example.com',
      passwordHash, // Same password 'password'
      name: 'John Doe',
      role: 'customer',
    },
  ]);

  // Create Products
  await knex('products').insert([
    {
      name: 'Premium Soft Diapers',
      description: 'Ultra-soft, absorbent diapers for sensitive skin.',
      price: 32.00,
      category: 'Diapers',
      stock: 100,
      images: JSON.stringify(['https://picsum.photos/seed/diaperpack/800/800']),
    },
    {
      name: 'Organic Baby Lotion',
      description: 'Gentle moisturizing lotion with aloe and chamomile.',
      price: 18.00,
      category: 'Skincare',
      stock: 50,
      images: JSON.stringify(['https://picsum.photos/seed/lotion/800/800']),
    },
    {
      name: 'Silicone Feeding Set',
      description: 'BPA-free silicone bowl, spoon, and bib set.',
      price: 28.00,
      category: 'Feeding',
      stock: 30,
      images: JSON.stringify(['https://picsum.photos/seed/feedingset/800/800']),
    },
  ]);
}
