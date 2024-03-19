import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { DatabaseModule } from 'shared/database/database.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from 'config/database.config';
import { CqrsModule } from '@nestjs/cqrs';
import { getLoggerToken } from 'nestjs-pino';
import {
  CreateReservationCommand,
  CreateReservationHandler,
} from './create-reservation.command';
import { ReservationItem } from 'reservation/core/entities/reservation-item.entity';
import { Reservation } from 'reservation/core/entities/reservation.entity';
import { createInventoryItem } from 'shared/database/factories/inventory-item.factory';
import { addMinutes } from 'date-fns';
import { ReservationOverlapException } from 'reservation/core/exceptions/reservation-overlap.exception';
import { createUser } from 'shared/database/factories/user.factory';
import { createLocation } from 'shared/database/factories/location.factory';
import {
  DomainEventPublisher,
  IDomainEventPublisher,
} from 'shared/event/domain-event-publisher';

describe('CreateReservationCommand', () => {
  let module: TestingModule;
  let em: EntityManager;
  let service: CreateReservationHandler;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
          isGlobal: true,
        }),
        DatabaseModule.forRoot({
          allowGlobalContext: true,
          debug: false,
          autoLoadEntities: false,
          entities: ['**/*.entity.ts'],
        }),
        CqrsModule.forRoot(),
        MikroOrmModule.forFeature([ReservationItem, Reservation]),
      ],
      controllers: [],
      providers: [
        {
          provide: getLoggerToken(CreateReservationHandler.name),
          useClass: class {
            info() {
              return jest.fn();
            }
          },
        },
        {
          provide: IDomainEventPublisher,
          useClass: DomainEventPublisher,
        },
        CreateReservationHandler,
      ],
    }).compile();
    em = module.get(EntityManager);
    service = module.get(CreateReservationHandler);
    const orm = module.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.clearDatabase();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should create new reservation', async () => {
    const userId = await createUser(em.fork(), {});
    const locationId = await createLocation(em, {});
    const id = await createInventoryItem(em.fork(), { locationId });
    const createReservationCommand = new CreateReservationCommand(
      id,
      new Date(),
      new Date(),
      userId,
    );

    await service.execute(createReservationCommand);

    const dbReservationItem = await em.fork().findOne(ReservationItem, { id });

    expect(dbReservationItem?.reservations.length).toBe(1);
    expect(dbReservationItem?.reservations[0]).toMatchObject({
      startDate: createReservationCommand.startDate,
      endDate: createReservationCommand.endDate,
      userId,
    });
  });

  it('should throw if the reservation for that time frame already exists', async () => {
    const userId = await createUser(em.fork(), {});
    const locationId = await createLocation(em, {});
    const id = await createInventoryItem(em.fork(), { locationId });
    const createReservationCommand = new CreateReservationCommand(
      id,
      new Date(),
      addMinutes(new Date(), 15),
      userId,
    );

    await service.execute(createReservationCommand);

    await expect(() => {
      return service.execute(createReservationCommand);
    }).rejects.toThrow(ReservationOverlapException);
  });
});
