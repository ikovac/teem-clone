import { OnLoad } from '@mikro-orm/postgresql';
import { BaseEntity } from './base.entity';
import { IEvent } from 'shared/event/base.event';

export abstract class AggregateRoot<
  EventBase extends IEvent = IEvent,
> extends BaseEntity {
  private internalEvents: EventBase[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  publish<T extends EventBase = EventBase>(event: T) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  publishAll<T extends EventBase = EventBase>(events: T[]) {}

  apply<T extends EventBase = EventBase>(event: T) {
    this.internalEvents.push(event);
  }

  commit() {
    this.publishAll(this.internalEvents);
    this.internalEvents.length = 0;
  }

  @OnLoad()
  setInitialState() {
    this.internalEvents = [];
  }
}
