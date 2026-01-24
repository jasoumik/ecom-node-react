import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('key').unique().notNullable();
    table.string('value').notNullable();
    table.string('description').nullable();
    table.timestamps(true, true);
  });

  // Insert default setting for inventory method
  await knex('settings').insert({
    key: 'inventory_method',
    value: 'FIFO', // Default to First-In-First-Out
    description: 'Inventory valuation method: FIFO or LIFO',
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('settings');
}
