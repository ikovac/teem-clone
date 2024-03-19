import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { DatabaseModule } from 'shared/database/database.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from 'config/database.config';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory-item.entity';
import { Location } from './location.entity';
import { createInventoryItem } from 'shared/database/factories/inventory-item.factory';
import { createLocation } from 'shared/database/factories/location.factory';
import { createReservation } from 'shared/database/factories/reservation.factory';
import { createUser } from 'shared/database/factories/user.factory';
import { addMinutes } from 'date-fns';

describe('InventoryService', () => {
  let module: TestingModule;
  let em: EntityManager;
  let service: InventoryService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [databaseConfig] }),
        DatabaseModule.forRoot({
          allowGlobalContext: true,
          debug: false,
          autoLoadEntities: false,
          entities: ['**/*.entity.ts'],
        }),
        MikroOrmModule.forFeature([InventoryItem, Location]),
      ],
      controllers: [],
      providers: [InventoryService],
    }).compile();
    em = module.get(EntityManager);
    service = module.get(InventoryService);
    const orm = module.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.clearDatabase();
  });

  afterEach(async () => {
    await module.close();
  });

  it('getAll should return all inventory items', async () => {
    const data = {
      title: 'inventory item title',
      type: 'room',
      data: { capacity: 5 },
      location: {
        title: 'location title',
        address: 'location address',
      },
    } as const;
    const locationId = await createLocation(em.fork(), data.location);
    const inventoryItemId = await createInventoryItem(em.fork(), {
      title: data.title,
      type: data.type,
      data: data.data,
      locationId,
    });

    const result = await service.getAll({});

    expect(result).toMatchObject({
      count: 1,
      data: [{ ...data, id: inventoryItemId }],
    });
  });

  it('getAll should return all inventory items available within a specified timeframe', async () => {
    const userId = await createUser(em.fork(), {});
    const locationId = await createLocation(em.fork(), {});
    const inventoryItem1Id = await createInventoryItem(em.fork(), {
      locationId,
    });
    const inventoryItem2Id = await createInventoryItem(em.fork(), {
      locationId,
    });
    const inventoryItem3Id = await createInventoryItem(em.fork(), {
      locationId,
    });
    const inventoryItem4Id = await createInventoryItem(em.fork(), {
      locationId,
    });
    const now = new Date();
    await createReservation(em.fork(), {
      userId,
      inventoryItemId: inventoryItem1Id,
      startDate: addMinutes(now, 10),
      endDate: addMinutes(now, 20),
    });
    await createReservation(em.fork(), {
      userId,
      inventoryItemId: inventoryItem1Id,
      startDate: addMinutes(now, 30),
      endDate: addMinutes(now, 40),
    });

    await createReservation(em.fork(), {
      userId,
      inventoryItemId: inventoryItem2Id,
      startDate: addMinutes(now, 10),
      endDate: addMinutes(now, 25),
    });

    await createReservation(em.fork(), {
      userId,
      inventoryItemId: inventoryItem3Id,
      startDate: addMinutes(now, 25),
      endDate: addMinutes(now, 35),
    });

    await createReservation(em.fork(), {
      userId,
      inventoryItemId: inventoryItem4Id,
      startDate: addMinutes(now, 25),
      endDate: addMinutes(now, 27),
    });
    await createReservation(em.fork(), {
      userId,
      inventoryItemId: inventoryItem4Id,
      startDate: addMinutes(now, 28),
      endDate: addMinutes(now, 29),
    });

    const result = await service.getAll({
      startDate: addMinutes(now, 20),
      endDate: addMinutes(now, 30),
    });

    expect(result).toMatchObject({
      count: 1,
      data: [{ id: inventoryItem1Id }],
    });
  });
});
