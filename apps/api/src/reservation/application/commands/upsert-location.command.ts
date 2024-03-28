import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import {
  CreateRequestContext,
  EntityManager,
  EntityRepository,
} from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Location } from 'reservation/core/entities/location.entity';

export class UpsertLocationCommand {
  constructor(
    public readonly cmsId: any,
    public readonly title: any,
    public readonly address: any,
  ) {}
}

@CommandHandler(UpsertLocationCommand)
export class UpsertLocationHandler
  implements ICommandHandler<UpsertLocationCommand>
{
  constructor(
    @InjectRepository(Location)
    private repository: EntityRepository<Location>,
    private em: EntityManager,
    private orm: MikroORM,
    @InjectPinoLogger(UpsertLocationHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  @CreateRequestContext()
  async execute(command: UpsertLocationCommand): Promise<void> {
    this.logger.info({ command }, 'Executing UpsertLocationCommand');

    const { cmsId, title, address } = command;

    const existingLocation = await this.repository.findOne({ cmsId });
    if (existingLocation) {
      existingLocation.update(title, address);
      await this.em.flush();
      return;
    }
    const location = new Location(cmsId, title, address);
    await this.em.persistAndFlush(location);
  }
}
