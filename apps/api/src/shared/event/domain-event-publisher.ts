import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { AggregateRoot } from 'shared/database/aggregate-root';
import { IEvent } from './base.event';

export interface Constructor<T> {
  new (...args: any[]): T;
}

export const IDomainEventPublisher = Symbol('IDomainEventPublisher');

export interface IDomainEventPublisher<EventBase extends IEvent = IEvent> {
  mergeObjectContext<T extends AggregateRoot<EventBase>>(object: T): T;
}

@Injectable()
export class DomainEventPublisher<EventBase extends IEvent = IEvent>
  implements IDomainEventPublisher<EventBase>
{
  constructor(private readonly eventBus: EventBus<EventBase>) {}

  mergeObjectContext<T extends AggregateRoot<EventBase>>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (event: EventBase) => {
      eventBus.publish(event, object);
    };

    object.publishAll = (events: EventBase[]) => {
      eventBus.publishAll(events, object);
    };
    return object;
  }
}
