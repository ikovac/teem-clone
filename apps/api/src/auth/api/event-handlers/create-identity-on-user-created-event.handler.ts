import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Topic, UserCreated } from 'shared/event/messaging';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { IdentityService } from 'auth/identity.service';

@Injectable()
export class CreateIdentityHandler {
  constructor(
    @InjectPinoLogger(CreateIdentityHandler.name)
    private readonly logger: PinoLogger,
    private identityService: IdentityService,
  ) {}

  @OnEvent(Topic.USER_CREATED, { async: true })
  async handle(payload: UserCreated) {
    this.logger.info({ payload }, 'Executing CreateIdentityHandler');
    const { email, role } = payload;
    await this.identityService.createIdentity({ email, role });
  }
}
