import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { ReservationItem } from './reservation-item.entity';
import { BaseEntity } from 'shared/database/base.entity';

@Entity()
export class Reservation extends BaseEntity {
  @Property()
  startDate: Date;

  @Property()
  endDate: Date;

  @ManyToOne({
    entity: () => ReservationItem,
    serializer: (it) => it.id,
    serializedName: 'reservationItemId',
    fieldName: 'inventory_item_id',
  })
  reservationItem!: ReservationItem;

  @Property()
  userId: number;

  constructor(
    reservationItem: ReservationItem,
    startDate: Date,
    endDate: Date,
    userId: number,
  ) {
    super();
    this.reservationItem = reservationItem;
    this.startDate = startDate;
    this.endDate = endDate;
    this.userId = userId;
  }
}
