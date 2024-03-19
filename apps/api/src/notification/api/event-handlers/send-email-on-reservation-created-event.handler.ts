import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReservationCreated, Topic } from 'shared/event/messaging';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { NotificationService } from 'notification/notification.service';

@Injectable()
export class SendReservationCreatedEmailHandler {
  constructor(
    @InjectPinoLogger(SendReservationCreatedEmailHandler.name)
    private readonly logger: PinoLogger,
    private notificationService: NotificationService,
  ) {}

  @OnEvent(Topic.RESERVATION_CREATED, { async: true })
  async handle(payload: ReservationCreated) {
    this.logger.info(
      { payload },
      'Executing SendReservationCreatedEmailHandler',
    );
    await this.notificationService.sendReservationCreatedNotification(payload);
  }
}
