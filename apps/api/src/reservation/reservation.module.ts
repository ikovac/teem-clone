import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ReservationItem } from './core/entities/reservation-item.entity';
import { Reservation } from './core/entities/reservation.entity';
import { ReservationController } from './api/http/reservation.controller';
import { CreateReservationHandler } from './application/commands/create-reservation.command';
import { SendReservationCreatedIntegrationEventHandler } from './application/event-handlers/send-reservation-created-integration-event.handler';
import { GetUserReservationsHandler } from './application/queries/get-user-reservations.query';
import { InventoryController } from './api/http/inventory.controller';
import { Location } from './core/entities/location.entity';
import { InventoryItem } from './core/entities/inventory-item.entity';
import { InventoryService } from './application/inventory.service';
import { GetInventoryItemsHandler } from './application/queries/get-inventory-items.query';

const commands = [CreateReservationHandler];
const queries = [GetUserReservationsHandler, GetInventoryItemsHandler];
const eventHandlers = [SendReservationCreatedIntegrationEventHandler];

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ReservationItem,
      Reservation,
      Location,
      InventoryItem,
    ]),
  ],
  controllers: [ReservationController, InventoryController],
  providers: [...commands, ...queries, ...eventHandlers, InventoryService],
})
export class ReservationModule {}
