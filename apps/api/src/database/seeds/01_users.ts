import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash('123456', salt);

  // Inserts seed entries
  await knex('users').insert([
    {
      id: '581f872e-4125-4ff4-aed5-a5afd1f4168d', // Keep a stable ID for admin
      phone: '01616684803',
      email: 'admin@prithibee.com',
      passwordHash,
      name: 'Admin',
      role: 'admin',
      is_active: true,
    },
    {
      phone: '01800000000',
      email: 'customer@prithibee.com',
      passwordHash,
      name: 'Test Customer',
      role: 'customer',
      is_active: true,
    },
  ]);
}
