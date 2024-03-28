import { Entity, Property, Unique } from '@mikro-orm/postgresql';
import { AggregateRoot } from 'shared/database/aggregate-root';

@Entity()
export class Location extends AggregateRoot {
  @Unique()
  @Property()
  cmsId: string;

  @Property()
  title: string;

  @Property()
  address: string;

  constructor(cmsId: string, title: string, address: string) {
    super();
    this.cmsId = cmsId;
    this.title = title;
    this.address = address;
  }

  update(title: string, address: string) {
    this.title = title;
    this.address = address;
  }
}
