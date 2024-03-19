import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { DatabaseModule } from 'shared/database/database.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from 'config/database.config';
import { ReservationItem } from 'reservation/core/entities/reservation-item.entity';
import { Reservation } from 'reservation/core/entities/reservation.entity';
import {
  GetUserReservationsHandler,
  GetUserReservationsQuery,
} from './get-user-reservations.query';
import { getLoggerToken } from 'nestjs-pino';
import { createUser } from 'shared/database/factories/user.factory';
import { IDateProvider } from 'shared/date.provider';
import { createInventoryItem } from 'shared/database/factories/inventory-item.factory';
import { createLocation } from 'shared/database/factories/location.factory';
import { createReservation } from 'shared/database/factories/reservation.factory';
import { addMinutes, subMinutes } from 'date-fns';

describe('GetUserReservationsQuery', () => {
  let module: TestingModule;
  let em: EntityManager;
  let service: GetUserReservationsHandler;

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
        MikroOrmModule.forFeature([ReservationItem, Reservation]),
      ],
      controllers: [],
      providers: [
        {
          provide: getLoggerToken(GetUserReservationsHandler.name),
          useClass: class {
            info() {
              return jest.fn();
            }
          },
        },
        {
          provide: IDateProvider,
          useValue: {
            now: () => new Date('2024-01-01T00:00:00Z'),
          },
        },
        GetUserReservationsHandler,
      ],
    }).compile();
    em = module.get(EntityManager);
    service = module.get(GetUserReservationsHandler);
    const orm = module.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.clearDatabase();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should return all active and future reservations', async () => {
    const userId = await createUser(em.fork(), {});
    const query = new GetUserReservationsQuery(userId);
    const dateProvider = module.get(IDateProvider);
    const now = dateProvider.now();
    const locationId = await createLocation(em.fork(), {});
    const reservationItemId = await createInventoryItem(em.fork(), {
      locationId,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pastReservationId = await createReservation(em.fork(), {
      userId,
      inventoryItemId: reservationItemId,
      startDate: subMinutes(now, 30),
      endDate: subMinutes(now, 10),
    });
    const currentReservationId = await createReservation(em.fork(), {
      userId,
      inventoryItemId: reservationItemId,
      startDate: subMinutes(now, 5),
      endDate: addMinutes(now, 5),
    });
    const futureReservationId = await createReservation(em.fork(), {
      userId,
      inventoryItemId: reservationItemId,
      startDate: addMinutes(now, 10),
      endDate: addMinutes(now, 30),
    });

    const reservations = await service.execute(query);
    const reservationsIds = reservations.map((it) => it.id);

    expect(reservationsIds).toEqual([
      currentReservationId,
      futureReservationId,
    ]);
  });
});
