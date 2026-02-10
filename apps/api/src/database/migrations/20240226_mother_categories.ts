import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Check if table exists first to avoid errors if init.ts was run
    const hasTable = await knex.schema.hasTable('mother_categories');
    if (!hasTable) {
        // Create mother_categories table
        await knex.schema.createTable('mother_categories', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()')); // Use uuid_generate_v4() to match init.ts
            table.string('name').notNullable();
            table.string('name_bn').nullable();
            table.string('slug').unique().notNullable();
            table.string('image').nullable();
            table.boolean('is_active').defaultTo(true);
            table.integer('sort_order').defaultTo(0);
            table.timestamps(true, true);
        });

        // Add mother_category_id to categories
        await knex.schema.alterTable('categories', (table) => {
            table.uuid('mother_category_id').nullable().references('id').inTable('mother_categories').onDelete('SET NULL');
        });

        // Add mother_category_id to brands
        await knex.schema.alterTable('brands', (table) => {
            table.uuid('mother_category_id').nullable().references('id').inTable('mother_categories').onDelete('SET NULL');
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('mother_categories');
    if (hasTable) {
        await knex.schema.alterTable('brands', (table) => {
            table.dropColumn('mother_category_id');
        });
        await knex.schema.alterTable('categories', (table) => {
            table.dropColumn('mother_category_id');
        });
        await knex.schema.dropTable('mother_categories');
    }
}
