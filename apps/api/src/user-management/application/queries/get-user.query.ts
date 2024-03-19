import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'user-management/core/entities/user.entity';
import { GetUserResult } from '../dto/get-user-result.dto';
import { EntityNotFoundException } from 'shared/exceptions/entity-not-found.exception';

export class GetUserQuery implements IQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, GetUserResult>
{
  constructor(
    @InjectPinoLogger(GetUserHandler.name)
    private readonly logger: PinoLogger,
    private em: EntityManager,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResult> {
    this.logger.info({
      msg: 'Executing GetUsersQuery',
      args: query,
    });
    const user = await this.em
      .createQueryBuilder(User)
      .select(['id', 'email', 'firstName', 'lastName'])
      .where({ id: query.id })
      .getSingleResult();
    if (!user) throw new EntityNotFoundException('User');
    return user;
  }
}
