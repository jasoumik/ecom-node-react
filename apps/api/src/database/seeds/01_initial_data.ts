import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  // We delete products here too to ensure clean slate, but we insert them in 02
  await knex('products').del();
  await knex('users').del();

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
}
