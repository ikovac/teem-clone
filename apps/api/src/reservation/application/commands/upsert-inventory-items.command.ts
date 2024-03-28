import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import {
  CreateRequestContext,
  EntityManager,
  EntityRepository,
} from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InventoryItem } from 'reservation/core/entities/inventory-item.entity';
import { Location } from 'reservation/core/entities/location.entity';
import { EntityNotFoundException } from 'shared/exceptions/entity-not-found.exception';

export class UpsertInventoryItemCommand {
  constructor(
    public readonly cmsId: any,
    public readonly type: any,
    public readonly title: any,
    public readonly data: any,
    public readonly locationCmsId: any,
  ) {}
}

@CommandHandler(UpsertInventoryItemCommand)
export class UpsertInventoryItemHandler
  implements ICommandHandler<UpsertInventoryItemCommand>
{
  constructor(
    @InjectRepository(Location)
    private locationRepository: EntityRepository<Location>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: EntityRepository<InventoryItem>,
    private em: EntityManager,
    private orm: MikroORM,
    @InjectPinoLogger(UpsertInventoryItemHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  @CreateRequestContext()
  async execute(command: UpsertInventoryItemCommand): Promise<void> {
    this.logger.info({ command }, 'Executing UpsertInventoryItemCommand');

    const { cmsId, type, title, data, locationCmsId } = command;

    const existingInventoryItem = await this.inventoryItemRepository.findOne({
      cmsId,
    });
    const location = await this.locationRepository.findOne({
      cmsId: locationCmsId,
    });
    if (!location) throw new EntityNotFoundException('Location');
    if (existingInventoryItem) {
      existingInventoryItem.update(title, data, location.id);
      await this.em.flush();
      return;
    }
    const inventoryItem = new InventoryItem(
      cmsId,
      title,
      type,
      data,
      location.id,
    );
    await this.em.persistAndFlush(inventoryItem);
  }
}
