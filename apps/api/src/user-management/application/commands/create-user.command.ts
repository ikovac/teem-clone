import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { IDomainEventPublisher } from 'shared/event/domain-event-publisher';
import { IUUIDProvider } from 'shared/uuid.provider';
import { Role, User } from 'user-management/core/entities/user.entity';
import { UserExistsException } from 'user-management/core/exceptions/user-exists.exception';
import {
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  roleSchema,
} from 'user-management/core/validation';
import { z } from 'zod';

export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly role: Role,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}

const createUserSchema = z.object({
  email: emailSchema,
  role: roleSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
});

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(IUUIDProvider) private uuidProvider: IUUIDProvider,
    @Inject(IDomainEventPublisher)
    private eventPublisher: IDomainEventPublisher,
    @InjectRepository(User) private repository: EntityRepository<User>,
    private em: EntityManager,
    @InjectPinoLogger(CreateUserHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: CreateUserCommand): Promise<User['id']> {
    this.logger.info({ command }, 'Executing CreateUserCommand');
    const { email, role, firstName, lastName } =
      await createUserSchema.parseAsync(command);
    const existingUser = await this.repository.findOne({ email });
    if (existingUser) throw new UserExistsException(email);
    const uuid = this.uuidProvider.generate();
    const user = this.eventPublisher.mergeObjectContext(
      new User(uuid, email, role, firstName, lastName),
    );
    await this.em.persistAndFlush(user);
    user.commit();
    return user.id;
  }
}
