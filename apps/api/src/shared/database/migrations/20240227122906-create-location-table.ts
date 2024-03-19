import { Migration } from '@mikro-orm/migrations';

const TABLE_NAME = 'location';

export class CreateLocationTable extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();
    const createLocationTable = knex.schema.createTable(TABLE_NAME, (table) => {
      table.increments('id').primary();
      table.string('cms_id').notNullable().unique();
      table.string('title').notNullable();
      table.string('address').notNullable();
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table
        .timestamp('updated_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    });
    this.addSql(createLocationTable.toQuery());
  }

  async down(): Promise<void> {
    this.addSql(this.getKnex().schema.dropTable(TABLE_NAME).toQuery());
  }
}
