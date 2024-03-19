import { faker } from '@faker-js/faker';
import type { EntityManager } from '@mikro-orm/postgresql';

type LocationData = {
  cmsId?: string;
  title?: string;
  address?: string;
};

export async function createLocation(
  em: EntityManager,
  data: LocationData,
): Promise<number> {
  const {
    cmsId = faker.string.alphanumeric(5),
    title = faker.word.words({ count: 2 }),
    address = 'Poljicka 43, Split',
  } = data;
  const knex = em.getKnex();
  const [{ id }] = await knex('location')
    .insert({
      cms_id: cmsId,
      title,
      address,
    })
    .returning('id');
  return id;
}
