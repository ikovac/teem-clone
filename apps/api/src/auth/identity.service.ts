import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Identity } from './identity.entity';
import { EntityNotFoundException } from 'shared/exceptions/entity-not-found.exception';
import { IdentityProviderService } from './identity-provider.service';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class IdentityService {
  constructor(
    private em: EntityManager,
    private identityProvider: IdentityProviderService,
    @InjectRepository(Identity)
    private identityRepository: EntityRepository<Identity>,
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

    try {
      const identity = await this.identityRepository.findOne({ uuid });
      if (!identity) throw new EntityNotFoundException('Identity');

      identity.linkToIdentity(identityProviderIdentity.id);
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
}
