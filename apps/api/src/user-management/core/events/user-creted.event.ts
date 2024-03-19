import { BaseEvent } from 'shared/event/base.event';

export class UserCreatedEvent extends BaseEvent {
  constructor(
    public uuid: string,
    public email: string,
    public role: string,
  ) {
    super();
  }
}
