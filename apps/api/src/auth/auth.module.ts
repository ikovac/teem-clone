import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Identity } from './identity.entity';
import { IdentityService } from './identity.service';
import { IdentityExternalService } from './api/external';
import { CreateIdentityHandler } from './api/event-handlers/create-identity-on-user-created-event.handler';
import { IdentityProviderService } from './identity-provider.service';

const eventHandlers = [CreateIdentityHandler];

@Module({
  imports: [MikroOrmModule.forFeature([Identity])],
  providers: [
    IdentityService,
    IdentityExternalService,
    IdentityProviderService,
    ...eventHandlers,
  ],
  exports: [IdentityExternalService],
})
export class AuthModule {}
