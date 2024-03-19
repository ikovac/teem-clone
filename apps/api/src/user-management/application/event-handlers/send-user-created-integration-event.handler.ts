import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Topic, UserCreated } from 'shared/event/messaging';
import { UserCreatedEvent } from 'user-management/core/events/user-creted.event';

@EventsHandler(UserCreatedEvent)
export class SendUserCreatedIntegrationEventHandler implements IEventHandler {
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectPinoLogger(SendUserCreatedIntegrationEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  handle(event: UserCreatedEvent) {
    this.logger.info({ event }, 'Sending UserCreated integration event');
    this.eventEmitter.emit(
      Topic.USER_CREATED,
      new UserCreated(event.uuid, event.email, event.role, event.createdAt),
    );
  }
}
