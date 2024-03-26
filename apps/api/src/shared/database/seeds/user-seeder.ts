import type { Dictionary, EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { createUser } from '../factories/user.factory';
import {
  getAll,
  create,
  IdentityProviderUser,
} from '../factories/identity-provider.factory';

const SEED_EMAIL_DOMAIN = 'example.org';
const SEED_PASSWORD = process.env.DB_SEED_USER_PASSWORD;

export class UserSeeder extends Seeder {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    const identityProviderUsers = await getAll(`email:*${SEED_EMAIL_DOMAIN}`);

    const adminEmail = `admin@${SEED_EMAIL_DOMAIN}`;
    const pAdmin = createUser(em, {
      email: adminEmail,
      identityProviderId: await this.getIdentityProviderId(
        adminEmail,
        identityProviderUsers,
      ),
      role: 'admin',
    });

    const pUsers = [...Array(10)].map(async (_, index) => {
      const email =
        index > 0
          ? `user${index}@${SEED_EMAIL_DOMAIN}`
          : `user@${SEED_EMAIL_DOMAIN}`;

      const identityProviderId = await this.getIdentityProviderId(
        email,
        identityProviderUsers,
      );

      return createUser(em, {
        email,
        identityProviderId,
        role: 'user',
      });
    });

    const users = await Promise.all([pAdmin, ...pUsers]);
    context.userIds = users;
  }

  private async getIdentityProviderId(
    email: string,
    identityProviderUsers: IdentityProviderUser[],
  ) {
    const existingUserId = identityProviderUsers.find(
      (user) => user.email === email,
    )?.user_id;

    return existingUserId ?? (await create(email, SEED_PASSWORD));
  }
}
