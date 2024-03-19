import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EntityManager } from '@mikro-orm/postgresql';
import { GetUserReservationsResult } from '../dto/get-user-reservations-result.dto';
import { Inject } from '@nestjs/common';
import { IDateProvider } from 'shared/date.provider';

export class GetUserReservationsQuery implements IQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetUserReservationsQuery)
export class GetUserReservationsHandler
  implements
    IQueryHandler<GetUserReservationsQuery, GetUserReservationsResult[]>
{
  constructor(
    @InjectPinoLogger(GetUserReservationsHandler.name)
    private readonly logger: PinoLogger,
    private em: EntityManager,
    @Inject(IDateProvider)
    private dateProvider: IDateProvider,
  ) {}

  async execute(
    query: GetUserReservationsQuery,
  ): Promise<GetUserReservationsResult[]> {
    this.logger.info({ query }, 'Executing GetUserReservationsQuery');
    const { userId } = query;
    const knex = this.em.getKnex();
    const now = this.dateProvider.now();

    return knex('reservation')
      .select([
        'reservation.id',
        'reservation.start_date as startDate',
        'reservation.end_date as endDate',
        'inventory_item.title',
      ])
      .innerJoin(
        'inventory_item',
        'reservation.inventory_item_id',
        'inventory_item.id',
      )
      .where('reservation.user_id', userId)
      .andWhere('reservation.end_date', '>=', now)
      .orderBy('reservation.start_date', 'asc');
  }
}
