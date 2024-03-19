import type { Dictionary, EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { createUser } from '../factories/user.factory';

export class UserSeeder extends Seeder {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    const pAdmin = createUser(em, {
      email: 'admin@example.org',
      role: 'admin',
    });
    const pUsers = [...Array(10)].map((_, index) => {
      const email = index > 0 ? `user${index}@example.org` : 'user@example.org';
      return createUser(em, {
        email,
        role: 'user',
      });
    });

    const users = await Promise.all([pAdmin, ...pUsers]);
    context.userIds = users;
  }
}
