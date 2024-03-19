import { Module } from '@nestjs/common';
import { SendReservationCreatedEmailHandler } from './api/event-handlers/send-email-on-reservation-created-event.handler';
import { MailProviderService } from './mail-provider.service';
import { NotificationService } from './notification.service';
import { UserManagementModule } from 'user-management/user-management.module';
import { UserManagementIntegration } from './user-management.integration';

const eventHandlers = [SendReservationCreatedEmailHandler];

@Module({
  imports: [UserManagementModule],
  providers: [
    NotificationService,
    MailProviderService,
    ...eventHandlers,
    UserManagementIntegration,
  ],
})
export class NotificationModule {}
