import { Migration } from '@mikro-orm/migrations';

const TABLE_NAME = 'inventory_item';
const types = ['room', 'desk'];

export class CreateInventoryItemTable extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();
    const createInventoryItemTable = knex.schema.createTable(
      TABLE_NAME,
      (table) => {
        table.increments('id').primary();
        table.string('cms_id').notNullable().unique();
        table.string('title').notNullable();
        table.jsonb('data').notNullable();
        table.enum('type', types);
        table.integer('location_id').notNullable();
        table.integer('version').notNullable().defaultTo(1);
        table
          .foreign('location_id')
          .references('location.id')
          .onDelete('CASCADE');
        table
          .timestamp('created_at', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp('updated_at', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
      },
    );
    this.addSql(createInventoryItemTable.toQuery());
  }

  async down(): Promise<void> {
    this.addSql(this.getKnex().schema.dropTable(TABLE_NAME).toQuery());
  }
}
