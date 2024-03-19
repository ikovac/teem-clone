import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Identity } from './identity.entity';
import { EntityNotFoundException } from 'shared/exceptions/entity-not-found.exception';
import { IdentityProviderService } from './identity-provider.service';

@Injectable()
export class IdentityService {
  constructor(
    private em: EntityManager,
    private identityProvider: IdentityProviderService,
  ) {}

  async createIdentity({ email, role }: { email: string; role: string }) {
    return this.identityProvider.createIdentity({ email, role });
  }

  async getByEmail(email: string): Promise<Identity> {
    const identity = await this.em
      .createQueryBuilder(Identity)
      .select(['id'])
      .where({ email })
      .limit(1)
      .getSingleResult();
    if (!identity) throw new EntityNotFoundException('Identity');
    return identity;
  }
}
