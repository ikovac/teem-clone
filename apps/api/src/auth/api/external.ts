import { Injectable } from '@nestjs/common';
import { IdentityService } from 'auth/identity.service';
import { pick } from 'radash';

@Injectable()
export class IdentityExternalService {
  constructor(private identityService: IdentityService) {}

  async getByIdentityProviderId(
    identityProviderId: string,
  ): Promise<{ id: number }> {
    const identity = await this.identityService.getByIdentityProviderId(
      identityProviderId,
    );
    return pick(identity, ['id']);
  }
}
