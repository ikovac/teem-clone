import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { DatabaseModule } from 'shared/database/database.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from 'config/database.config';
import { CqrsModule } from '@nestjs/cqrs';
import { IUUIDProvider } from 'shared/uuid.provider';
import { Role, User } from 'user-management/core/entities/user.entity';
import { UserExistsException } from 'user-management/core/exceptions/user-exists.exception';
import { CreateUserCommand, CreateUserHandler } from './create-user.command';
import { getLoggerToken } from 'nestjs-pino';
import {
  DomainEventPublisher,
  IDomainEventPublisher,
} from 'shared/event/domain-event-publisher';

describe('CreateUserCommand', () => {
  let module: TestingModule;
  let em: EntityManager;
  let service: CreateUserHandler;

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
        CqrsModule.forRoot(),
        MikroOrmModule.forFeature([User]),
      ],
      controllers: [],
      providers: [
        {
          provide: IUUIDProvider,
          useClass: class {
            generate() {
              return '123';
            }
          },
        },
        {
          provide: IDomainEventPublisher,
          useClass: DomainEventPublisher,
        },
        {
          provide: getLoggerToken(CreateUserHandler.name),
          useClass: class {
            info() {
              return jest.fn();
            }
          },
        },
        CreateUserHandler,
      ],
    }).compile();
    em = module.get(EntityManager);
    service = module.get(CreateUserHandler);
    const orm = module.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.clearDatabase();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should create a new user', async () => {
    const createUserCommand = new CreateUserCommand(
      'test@example.org',
      Role.USER,
      'first',
      'last',
    );

    await service.execute(createUserCommand);

    const dbUser = await em
      .fork()
      .findOne(User, { email: createUserCommand.email });

    expect(dbUser).toHaveProperty('id');
    expect(dbUser).toMatchObject({ uuid: '123', ...createUserCommand });
  });

  it('should thrown an error if user already exists', async () => {
    const createUserCommand = new CreateUserCommand(
      'test@example.org',
      Role.USER,
      'first',
      'last',
    );
    await service.execute(createUserCommand);

    await expect(service.execute(createUserCommand)).rejects.toThrow(
      UserExistsException,
    );
  });
});
