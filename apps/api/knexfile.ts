import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();


const config: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'ecom',
    user: process.env.DB_USERNAME || 'jasoumik',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || undefined,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/database/seeds',
  },
};

export default config;
