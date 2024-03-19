import { Entity, Enum, Property, Unique } from '@mikro-orm/postgresql';
import { AggregateRoot } from 'shared/database/aggregate-root';
import { UserCreatedEvent } from '../events/user-creted.event';

export const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

@Entity()
export class User extends AggregateRoot {
  @Unique()
  @Property()
  email: string;

  @Unique()
  @Property()
  uuid: string;

  @Enum(() => Role)
  role: Role;

  @Property()
  firstName: string;

  @Property()
  lastName: string;

  constructor(
    uuid: string,
    email: string,
    role: Role,
    firstName: string,
    lastName: string,
  ) {
    super();
    this.uuid = uuid;
    this.email = email;
    this.role = role;
    this.firstName = firstName;
    this.lastName = lastName;

    this.apply(new UserCreatedEvent(uuid, email, role));
  }
}
