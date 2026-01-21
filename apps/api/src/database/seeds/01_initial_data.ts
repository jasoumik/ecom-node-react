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
}
