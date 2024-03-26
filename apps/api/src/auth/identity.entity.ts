import { Entity, Enum, Property, Unique } from '@mikro-orm/core';
import { AggregateRoot } from 'shared/database/aggregate-root';

export const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

@Entity({ tableName: 'user' })
export class Identity extends AggregateRoot {
  @Unique()
  @Property()
  readonly email: string;

  @Unique()
  @Property()
  readonly uuid: string;

  @Unique()
  @Property()
  identityProviderId: string;

  @Enum(() => Role)
  readonly role: Role;

  linkToIdentity(identityProviderId: string) {
    this.identityProviderId = identityProviderId;
  }
}
