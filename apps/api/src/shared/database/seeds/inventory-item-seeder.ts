import type { Dictionary, EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { createInventoryItem } from '../factories/inventory-item.factory';
import cmsConfig from 'config/cms.config';
import { createClient } from '@sanity/client';
import { createLocation } from '../factories/location.factory';

export class InventoryItemSeeder extends Seeder {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    const config = cmsConfig();
    const sanityClient = createClient({
      projectId: config.projectId,
      dataset: config.dataset,
      token: config.apiToken,
    });

    const sLocations = await sanityClient.fetch(`
      *[_type=="location"] {
        'cmsId': _id,
        title,
        address
      }
    `);
    const pLocations = sLocations.map(async (it: any) => {
      const id = await createLocation(em, it);
      return { ...it, id };
    });
    const locations = await Promise.all(pLocations);

    const sInventoryItems = await sanityClient.fetch(`
        *[_type=="desk" || _type=="room"]{
          'cmsId': _id,
          'type': _type,
          title,
          equipment,
          capacity,
          location->{ 'cmsId': _id, title, address }
        }
      `);
    const pInventoryItemIds = sInventoryItems.map(async (it: any) => {
      const locationId = locations.find(
        (location: any) => it.location.cmsId === location.cmsId,
      ).id;
      const data =
        it.type === 'room'
          ? { capacity: it.capacity }
          : { equipment: it.equipment };
      const id = await createInventoryItem(em, {
        cmsId: it.cmsId,
        data,
        locationId,
        title: it.title,
        type: it.type,
      });
      return id;
    });
    const inventoryItemIds = await Promise.all(pInventoryItemIds);

    context.inventoryItemIds = inventoryItemIds;
  }
}
