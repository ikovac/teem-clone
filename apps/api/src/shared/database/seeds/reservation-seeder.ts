import type { Dictionary, EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { createReservation } from '../factories/reservation.factory';

export class ReservationSeeder extends Seeder {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    const reservations = [...Array(10)].map(() => {
      return createReservation(em, {
        inventoryItemId: context.inventoryItemIds[0],
        userId: context.userIds[1],
      });
    });

    await Promise.all(reservations);
  }
}
