import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { pick } from 'radash';
import { GetUserQuery } from 'user-management/application/queries/get-user.query';

@Injectable()
export class UserExternalService {
  constructor(private queryBus: QueryBus) {}

  async getUserById(id: number): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  }> {
    const user = await this.queryBus.execute(new GetUserQuery(id));
    return pick(user, ['id', 'email', 'firstName', 'lastName']);
  }
}
