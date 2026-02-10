import knex from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseProviders = [
  {
    provide: 'KNEX_CONNECTION',
    useFactory: async () => {
      const config = {
        client: 'postgresql',
        connection: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'ecom',
          user: process.env.DB_USERNAME || 'ecom_user',
          password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'strong_ecom_password',
        },
        pool: {
          min: 2,
          max: 10,
        },
      };
      return knex(config);
    },
  },
];
