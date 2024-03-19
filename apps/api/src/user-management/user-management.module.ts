import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from './core/entities/user.entity';
import { CreateUserHandler } from './application/commands/create-user.command';
import { SendUserCreatedIntegrationEventHandler } from './application/event-handlers/send-user-created-integration-event.handler';
import { UserManagementController } from './api/http/user-management.controller';
import { GetAllUsersHandler } from './application/queries/get-all-users.query';
import { GetUserHandler } from './application/queries/get-user.query';
import { UserExternalService } from './api/external';

const commands = [CreateUserHandler];
const queries = [GetAllUsersHandler, GetUserHandler];
const eventHandlers = [SendUserCreatedIntegrationEventHandler];

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [UserManagementController],
  providers: [
    ...commands,
    ...queries,
    ...eventHandlers,
    { provide: 'IUserExternalService', useClass: UserExternalService },
  ],
  exports: ['IUserExternalService'],
})
export class UserManagementModule {}
