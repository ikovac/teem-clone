import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuthenticationClient, ManagementClient } from 'auth0';
import authConfig from 'config/auth.config';
import passwordGenerator from 'generate-password';

@Injectable()
export class IdentityProviderService {
  private managementClient: ManagementClient;
  private authClient: AuthenticationClient;

  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
  ) {
    const { domain, managementApiIdentifier, clientId, clientSecret } = config;

    this.managementClient = new ManagementClient({
      domain,
      clientId,
      clientSecret,
      audience: managementApiIdentifier,
    });

    this.authClient = new AuthenticationClient({
      domain,
      clientId,
      clientSecret,
    });
  }

  async createIdentity({ email, role }: { email: string; role: string }) {
    const identity = await this.managementClient.users.create({
      email,
      email_verified: false,
      password: passwordGenerator.generate({
        length: 12,
        numbers: true,
        symbols: true,
      }),
      connection: this.config.connection,
    });

    const roles = await this.getRoles();
    const auth0Role = roles.find((it) => it.name === role);

    if (!auth0Role) throw new Error(`Role: ${role} not found`);

    await this.managementClient.users.assignRoles(
      { id: identity.data.user_id },
      { roles: [auth0Role.id] },
    );

    await this.authClient.database.changePassword({
      email,
      connection: this.config.connection,
    });

    return {
      id: identity.data.user_id,
      email: identity.data.email,
      role: auth0Role.name,
    };
  }

  async deleteIdentity(id: string) {
    return this.managementClient.users.delete({ id });
  }

  async getRoles() {
    const roles = await this.managementClient.roles.getAll();
    return roles.data.map((it) => ({ id: it.id, name: it.name }));
  }
}
