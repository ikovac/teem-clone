import { Entity, Enum, Property, Unique } from '@mikro-orm/postgresql';
import { AggregateRoot } from 'shared/database/aggregate-root';

export const InventoryType = {
  ROOM: 'room',
  DESK: 'desk',
} as const;

export type RoomData = {
  capacity: number;
};
export type DeskData = {
  equipment: string[];
};
export type InventoryData = RoomData | DeskData;

export type InventoryType = (typeof InventoryType)[keyof typeof InventoryType];

@Entity()
export class InventoryItem extends AggregateRoot {
  @Unique()
  @Property()
  cmsId: string;

  @Enum(() => InventoryType)
  type: InventoryType;

  @Property()
  title: string;

  @Property({ type: 'jsonb' })
  data: InventoryData;

  @Property()
  locationId: number;

  constructor(
    cmsId: string,
    title: string,
    type: InventoryType,
    data: InventoryData,
    locationId: number,
  ) {
    super();
    this.cmsId = cmsId;
    this.title = title;
    this.type = type;
    this.data = data;
    this.locationId = locationId;
  }

  update(title: string, data: InventoryData, locationId: number) {
    this.title = title;
    this.data = data;
    this.locationId = locationId;
  }
}
