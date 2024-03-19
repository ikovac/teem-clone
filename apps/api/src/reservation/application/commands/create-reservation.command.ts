import { MikroORM, OptimisticLockError } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  CreateRequestContext,
  EntityManager,
  EntityRepository,
  LockMode,
} from '@mikro-orm/postgresql';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ReservationItem } from 'reservation/core/entities/reservation-item.entity';
import { IDomainEventPublisher } from 'shared/event/domain-event-publisher';
import promiseRetry from 'promise-retry';
import {
  endDateSchema,
  idSchema,
  startDateSchema,
  userIdSchema,
} from 'reservation/core/validation';
import { z } from 'zod';
import { EntityNotFoundException } from 'shared/exceptions/entity-not-found.exception';

export class CreateReservationCommand {
  constructor(
    public readonly reservationItemId: number,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly userId: number,
  ) {}
}

const createReservationSchema = z.object({
  reservationItemId: idSchema,
  startDate: startDateSchema,
  endDate: endDateSchema,
  userId: userIdSchema,
});

@CommandHandler(CreateReservationCommand)
export class CreateReservationHandler
  implements ICommandHandler<CreateReservationCommand>
{
  constructor(
    @Inject(IDomainEventPublisher)
    private eventPublisher: IDomainEventPublisher,
    @InjectRepository(ReservationItem)
    private repository: EntityRepository<ReservationItem>,
    private em: EntityManager,
    private orm: MikroORM,
    @InjectPinoLogger(CreateReservationHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  @RetryOnError(OptimisticLockError)
  @CreateRequestContext()
  async execute(command: CreateReservationCommand): Promise<void> {
    this.logger.info({ command }, 'Executing CreateReservationCommand');
    const {
      userId,
      reservationItemId: id,
      startDate,
      endDate,
    } = await createReservationSchema.parseAsync(command);
    const entity = await this.repository.findOne({ id });
    if (!entity) throw new EntityNotFoundException('ReservationItem');
    await this.em.lock(entity, LockMode.OPTIMISTIC, entity.version);
    const reservationItem = this.eventPublisher.mergeObjectContext(entity);
    // await sleep(4000);
    reservationItem.createReservation(startDate, endDate, userId);
    await this.em.flush();
    reservationItem.commit();
  }
}

function RetryOnError(...errors: any[]) {
  return (
    _target: CreateReservationHandler,
    _key: string,
    descriptor: PropertyDescriptor,
  ) => {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      return promiseRetry(
        (retry) => {
          return method.apply(this, args).catch((err: any) => {
            if (errors.some((it) => err instanceof it)) return retry(err);
            throw err;
          });
        },
        { retries: 2 },
      );
    };
  };
}

// function sleep(ms: number) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(1);
//     }, ms);
//   });
// }
