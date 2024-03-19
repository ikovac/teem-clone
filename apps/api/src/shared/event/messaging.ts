export const Topic = {
  USER_CREATED: 'user.created',
  RESERVATION_CREATED: 'reservation.created',
} as const;

interface IIntegrationEvent {
  readonly occurredOn: Date;
}

export class UserCreated implements IIntegrationEvent {
  constructor(
    readonly uuid: string,
    readonly email: string,
    readonly role: string,
    readonly occurredOn: Date,
  ) {}
}

export class ReservationCreated implements IIntegrationEvent {
  constructor(
    readonly reservationItemTitle: string,
    readonly startDate: Date,
    readonly endDate: Date,
    readonly userId: number,
    readonly occurredOn: Date,
  ) {}
}
