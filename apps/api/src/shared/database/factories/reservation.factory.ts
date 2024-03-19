import { faker } from '@faker-js/faker';
import type { EntityManager } from '@mikro-orm/postgresql';

type ReservationData = {
  inventoryItemId: number;
  userId: number;
  startDate?: Date;
  endDate?: Date;
};

export async function createReservation(
  em: EntityManager,
  data: ReservationData,
): Promise<number> {
  const {
    startDate = faker.date.soon({ days: 1 }),
    endDate = faker.date.soon({ days: 2 }),
    userId,
    inventoryItemId,
  } = data;
  const knex = em.getKnex();
  const [{ id }] = await knex('reservation')
    .insert({
      start_date: startDate,
      end_date: endDate,
      inventory_item_id: inventoryItemId,
      user_id: userId,
    })
    .returning('id');
  return id;
}
