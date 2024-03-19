import type { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { UserSeeder } from './user-seeder';
import { InventoryItemSeeder } from './inventory-item-seeder';
import { ReservationSeeder } from './reservation-seeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    return this.call(em, [UserSeeder, InventoryItemSeeder, ReservationSeeder]);
  }
}
