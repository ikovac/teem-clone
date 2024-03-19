import { faker } from '@faker-js/faker';
import type { EntityManager } from '@mikro-orm/postgresql';

type InventoryItemData = {
  cmsId?: string;
  title?: string;
  type?: 'room' | 'desk';
  data?: Record<string, any>;
  locationId: number;
};

export async function createInventoryItem(
  em: EntityManager,
  payload: InventoryItemData,
): Promise<number> {
  const {
    cmsId = faker.string.alphanumeric(5),
    title = faker.word.words({ count: 2 }),
    type = 'room',
    data = { capacity: faker.number.int() },
    locationId,
  } = payload;
  const knex = em.getKnex();
  const [{ id }] = await knex('inventory_item')
    .insert({
      cms_id: cmsId,
      title,
      type,
      data,
      location_id: locationId,
    })
    .returning('id');
  return id;
}
