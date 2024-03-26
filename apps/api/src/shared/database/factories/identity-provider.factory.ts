import { ManagementClient } from 'auth0';
import authConfig from 'config/auth.config';

export type IdentityProviderUser = {
  user_id: string;
  email: string;
};

const { domain, managementApiIdentifier, clientId, clientSecret } =
  authConfig();
const managementClient = new ManagementClient({
  domain,
  clientId,
  clientSecret,
  audience: managementApiIdentifier,
});

export async function getAll(filter: string): Promise<IdentityProviderUser[]> {
  const userResult = await managementClient.users.getAll({
    q: filter,
    fields: 'user_id,email',
  });
  return userResult.data;
}

export async function create(email: string, password: string) {
  const user = await managementClient.users.create({
    email,
    password,
    connection: 'Username-Password-Authentication',
  });

  return user.data.user_id;
}
