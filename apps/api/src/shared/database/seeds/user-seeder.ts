import type { Dictionary, EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { createUser } from '../factories/user.factory';
import { ManagementClient } from 'auth0';
import authConfig from 'config/auth.config';

const { domain, managementApiIdentifier, clientId, clientSecret } =
  authConfig();
const managementClient = new ManagementClient({
  domain,
  clientId,
  clientSecret,
  audience: managementApiIdentifier,
});

const SEED_EMAIL_DOMAIN = 'example.org';

export class UserSeeder extends Seeder {
  identityProviderUsers: { user_id: string; email: string }[];

  async run(em: EntityManager, context: Dictionary): Promise<void> {
    this.identityProviderUsers = (
      await managementClient.users.getAll({
        q: `email:*${SEED_EMAIL_DOMAIN}`,
        fields: 'user_id,email',
      })
    ).data;

    const adminEmail = `admin@${SEED_EMAIL_DOMAIN}`;
    const pAdmin = createUser(em, {
      email: adminEmail,
      identityProviderId: this.getIdentityProviderId(adminEmail),
      role: 'admin',
    });

    const pUsers = [...Array(10)].map(async (_, index) => {
      const email =
        index > 0
          ? `user${index}@${SEED_EMAIL_DOMAIN}`
          : `user@${SEED_EMAIL_DOMAIN}`;

      const identityProviderId = this.getIdentityProviderId(email);

      return createUser(em, {
        email,
        identityProviderId,
        role: 'user',
      });
    });

    const users = await Promise.all([pAdmin, ...pUsers]);
    context.userIds = users;
  }

  private getIdentityProviderId(email: string) {
    return this.identityProviderUsers.find((user) => user.email === email)
      ?.user_id;
  }
}
