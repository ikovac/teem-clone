import { Migration } from '@mikro-orm/migrations';

const TABLE_NAME = 'reservation';

export class CreateReservationTable extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();
    const createReservationTable = knex.schema.createTable(
      TABLE_NAME,
      (table) => {
        table.increments('id').primary();
        table.timestamp('start_date').notNullable();
        table.timestamp('end_date').notNullable();
        table.integer('inventory_item_id').notNullable();
        table.integer('user_id').notNullable();
        table
          .foreign('inventory_item_id')
          .references('inventory_item.id')
          .onDelete('CASCADE');
        table.foreign('user_id').references('user.id').onDelete('CASCADE');
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
    this.addSql(createReservationTable.toQuery());
  }

  async down(): Promise<void> {
    this.addSql(this.getKnex().schema.dropTable(TABLE_NAME).toQuery());
  }
}
