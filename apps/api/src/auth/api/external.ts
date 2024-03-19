import { Injectable } from '@nestjs/common';
import { IdentityService } from 'auth/identity.service';
import { pick } from 'radash';

@Injectable()
export class IdentityExternalService {
  constructor(private identityService: IdentityService) {}

  async getByEmail(email: string): Promise<{ id: number }> {
    const identity = await this.identityService.getByEmail(email);
    return pick(identity, ['id']);
  }
}
