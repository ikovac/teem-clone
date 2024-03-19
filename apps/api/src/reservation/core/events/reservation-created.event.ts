import { BaseEvent } from 'shared/event/base.event';

export class ReservationCreatedEvent extends BaseEvent {
  constructor(
    public readonly reservationItemTitle: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly userId: number,
  ) {
    super();
  }
}
