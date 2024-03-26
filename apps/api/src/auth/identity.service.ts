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

  async createIdentity({
    email,
    role,
    uuid,
  }: {
    email: string;
    role: string;
    uuid: string;
  }) {
    const identityProviderIdentity = await this.identityProvider.createIdentity(
      {
        email,
        role,
      },
    );

    const identity = await this.getByUuid(uuid);
    identity.linkToIdentity(identityProviderIdentity.id);

    try {
      await this.em.flush();
    } catch (er) {
      this.identityProvider.deleteIdentity(identityProviderIdentity.id);
      throw er;
    }

    return identityProviderIdentity;
  }

  async getByIdentityProviderId(identityProviderId: string): Promise<Identity> {
    const identity = await this.em
      .createQueryBuilder(Identity)
      .select(['id'])
      .where({ identityProviderId })
      .limit(1)
      .getSingleResult();
    if (!identity) throw new EntityNotFoundException('Identity');
    return identity;
  }

  private async getByUuid(uuid: string): Promise<Identity> {
    const identity = await this.em
      .createQueryBuilder(Identity)
      .select(['id'])
      .where({ uuid })
      .limit(1)
      .getSingleResult();
    if (!identity) throw new EntityNotFoundException('Identity');
    return identity;
  }
}
