import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { AggregateRoot } from 'shared/database/aggregate-root';
import { Reservation } from './reservation.entity';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { ReservationOverlapException } from '../exceptions/reservation-overlap.exception';
import { ReservationCreatedEvent } from '../events/reservation-created.event';

export const isEqualOrAfter = (date: Date, dateToCompare: Date): boolean =>
  isAfter(date, dateToCompare) || isEqual(date, dateToCompare);

export const isEqualOrBefore = (date: Date, dateToCompare: Date): boolean =>
  isBefore(date, dateToCompare) || isEqual(date, dateToCompare);

@Entity({ tableName: 'inventory_item' })
export class ReservationItem extends AggregateRoot {
  @Property()
  readonly title: string;

  @Property({ version: true })
  readonly version: number = 1;

  @OneToMany({
    entity: () => Reservation,
    mappedBy: (it) => it.reservationItem,
    orphanRemoval: true,
    eager: true,
  })
  private _reservations = new Collection<Reservation>(this);

  createReservation(startDate: Date, endDate: Date, userId: number) {
    const overlapingReservation = this.reservations.some((it) => {
      return (
        (isEqualOrAfter(startDate, it.startDate) &&
          isBefore(startDate, it.endDate)) || // b starts in a
        (isAfter(endDate, it.startDate) &&
          isEqualOrBefore(endDate, it.endDate)) || // b ends in a
        (isBefore(startDate, it.startDate) && isAfter(endDate, it.endDate)) // b includes a
      );
    });

    if (overlapingReservation) throw new ReservationOverlapException();
    const reservation = new Reservation(this, startDate, endDate, userId);
    this._reservations.add(reservation);
    this.updatedAt = new Date();
    this.apply(
      new ReservationCreatedEvent(this.title, startDate, endDate, userId),
    );
  }

  get reservations() {
    return this._reservations.getItems();
  }
}
