import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ReservationCreatedEvent } from 'reservation/core/events/reservation-created.event';
import { ReservationCreated, Topic } from 'shared/event/messaging';

@EventsHandler(ReservationCreatedEvent)
export class SendReservationCreatedIntegrationEventHandler
  implements IEventHandler
{
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectPinoLogger(SendReservationCreatedIntegrationEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  handle(event: ReservationCreatedEvent) {
    this.logger.info({ event }, 'Sending ReservationCreated integration event');
    this.eventEmitter.emit(
      Topic.RESERVATION_CREATED,
      new ReservationCreated(
        event.reservationItemTitle,
        event.startDate,
        event.endDate,
        event.userId,
        event.createdAt,
      ),
    );
  }
}
