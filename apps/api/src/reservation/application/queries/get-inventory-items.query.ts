import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EntityManager } from '@mikro-orm/postgresql';
import { GetInventoryItemsResult } from '../dto/get-inventory-items-result.dto';

export class GetInventoryItemsQuery implements IQuery {
  constructor(
    public readonly pagination: any,
    public readonly startDate: any,
    public readonly endDate: any,
  ) {}
}

@QueryHandler(GetInventoryItemsQuery)
export class GetInventoryItemsHandler
  implements
    IQueryHandler<
      GetInventoryItemsQuery,
      { data: GetInventoryItemsResult[]; count: number }
    >
{
  constructor(
    @InjectPinoLogger(GetInventoryItemsHandler.name)
    private readonly logger: PinoLogger,
    private em: EntityManager,
  ) {}

  async execute(
    query: GetInventoryItemsQuery,
  ): Promise<{ data: GetInventoryItemsResult[]; count: number }> {
    this.logger.info({ query }, 'Executing GetInventoryItemsQuery');

    const { pagination, startDate, endDate } = query;

    const hasDateRange = startDate && endDate;
    const knex = this.em.getKnex();

    const baseQuery = knex
      .from({ inventory: 'inventory_item' })
      .innerJoin('location', 'inventory.location_id', 'location.id');

    if (hasDateRange) {
      const reservationsQuery = knex
        .from('reservation')
        .distinct('inventory_item_id')
        .whereRaw('(start_date, end_date) OVERLAPS(?, ?)', [
          startDate,
          endDate,
        ]);

      baseQuery.whereNotIn('inventory.id', reservationsQuery);
    }

    const selectLocationFields = knex.raw(
      `json_agg(json_build_object('title', location.title, 'address', location.address))->0 as location`,
    );

    const dataQeury = baseQuery
      .clone()
      .select(
        'inventory.id',
        'inventory.title',
        'inventory.type',
        'inventory.data',
        selectLocationFields,
      )
      .groupBy(['inventory.id', 'location.id'])
      .orderBy('inventory.id', 'asc');

    if (pagination) {
      const limit = pagination.itemsPerPage;
      const offset = (pagination.page - 1) * pagination.itemsPerPage;
      dataQeury.limit(limit).offset(offset);
    }

    const data = await dataQeury;
    const { count } = await baseQuery.clone().count().first();
    return { data, count: Number(count) };
  }
}
