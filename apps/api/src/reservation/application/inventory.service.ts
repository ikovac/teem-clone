import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Location } from '../core/entities/location.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InventoryItem } from '../core/entities/inventory-item.entity';
import { EntityNotFoundException } from 'shared/exceptions/entity-not-found.exception';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: EntityRepository<Location>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: EntityRepository<InventoryItem>,
    private em: EntityManager,
  ) {}

  async upsertLocation({ cmsId, title, address }: any) {
    const existingLocation = await this.locationRepository.findOne({ cmsId });
    if (existingLocation) {
      existingLocation.update(title, address);
      await this.em.flush();
      return;
    }
    const location = new Location(cmsId, title, address);
    await this.em.persistAndFlush(location);
  }

  async upsertInventoryItem({ cmsId, type, title, data, locationCmsId }: any) {
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
