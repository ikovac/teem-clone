import { faker } from '@faker-js/faker';
import type { EntityManager } from '@mikro-orm/postgresql';

type UserData = {
  uuid?: string;
  email?: string;
  role?: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
};

export async function createUser(
  em: EntityManager,
  data: UserData,
): Promise<number> {
  const knex = em.getKnex();
  const {
    uuid = faker.string.uuid(),
    email = faker.internet.email({ provider: 'example.org' }),
    role = 'user',
    firstName = faker.person.firstName(),
    lastName = faker.person.lastName(),
  } = data;
  const [{ id }] = await knex('user')
    .insert({
      uuid,
      email,
      role,
      first_name: firstName,
      last_name: lastName,
    })
    .returning('id');
  return id;
}
