import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { GetAllUsersResult } from '../dto/get-all-users-result.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'user-management/core/entities/user.entity';
import { Pagination } from 'shared/types/pagination';

export class GetAllUsersQuery implements IQuery {
  constructor(public readonly pagination?: Pagination) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler
  implements IQueryHandler<GetAllUsersQuery, GetAllUsersResult>
{
  constructor(
    @InjectPinoLogger(GetAllUsersHandler.name)
    private readonly logger: PinoLogger,
    private em: EntityManager,
  ) {}

  async execute(query: GetAllUsersQuery): Promise<GetAllUsersResult> {
    this.logger.info({
      msg: 'Executing GetUsersQuery',
      args: query,
    });
    const { pagination } = query;
    const qb = this.em
      .createQueryBuilder(User)
      .select(['id', 'email', 'role', 'firstName', 'lastName'])
      .orderBy({ id: 'ASC' });
    if (pagination) {
      const limit = pagination.itemsPerPage;
      const offset = (pagination.page - 1) * pagination.itemsPerPage;
      qb.limit(limit).offset(offset);
    }
    const [data, count] = await qb.getResultAndCount();
    return { data, count };
  }
}
