import { EntityManager } from '@mikro-orm/postgresql';
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(private em: EntityManager) {}

  @Get()
  async healthCheck() {
    const isConnected = await this.em.getConnection().isConnected();
    if (!isConnected) throw new ServiceUnavailableException();
  }
}
