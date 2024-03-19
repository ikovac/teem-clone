import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ReservationItem } from './core/entities/reservation-item.entity';
import { Reservation } from './core/entities/reservation.entity';
import { ReservationController } from './api/http/reservation.controller';
import { CreateReservationHandler } from './application/commands/create-reservation.command';
import { SendReservationCreatedIntegrationEventHandler } from './application/event-handlers/send-reservation-created-integration-event.handler';
import { GetUserReservationsHandler } from './application/queries/get-user-reservations.query';

const commands = [CreateReservationHandler];
const queries = [GetUserReservationsHandler];
const eventHandlers = [SendReservationCreatedIntegrationEventHandler];

@Module({
  imports: [MikroOrmModule.forFeature([ReservationItem, Reservation])],
  controllers: [ReservationController],
  providers: [...commands, ...queries, ...eventHandlers],
})
export class ReservationModule {}
