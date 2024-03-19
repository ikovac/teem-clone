import { OptimisticLockError } from '@mikro-orm/core';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateReservationCommand } from 'reservation/application/commands/create-reservation.command';
import { CreateReservationPayload } from 'reservation/application/dto/create-reservation-payload.dto';
import { GetUserReservationsResult } from 'reservation/application/dto/get-user-reservations-result.dto';
import { GetUserReservationsQuery } from 'reservation/application/queries/get-user-reservations.query';
import { ReservationOverlapException } from 'reservation/core/exceptions/reservation-overlap.exception';
import { AuthGuard } from 'shared/auth/auth.guard';
import { Permissions } from 'shared/auth/permission.decorator';
import { TransformResponseInterceptor } from 'shared/transform-response.interceptor';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(AuthGuard)
@UseInterceptors(TransformResponseInterceptor)
export class ReservationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBody({ type: CreateReservationPayload })
  @ApiResponse({
    status: 201,
    description: 'The reservation record has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'The payload is invalid.',
  })
  @ApiResponse({
    status: 409,
    description: 'Reservation overlaps with an existing reservation.',
  })
  @Permissions('create:reservations')
  @Post()
  async create(@Req() req: Request, @Body() body: any): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreateReservationCommand(
          body.reservationItemId,
          body.startDate,
          body.endDate,
          req.userId!,
        ),
      );
    } catch (error) {
      if (
        error instanceof ReservationOverlapException ||
        error instanceof OptimisticLockError
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: [GetUserReservationsResult],
  })
  @Permissions('read:reservations')
  getAll(@Req() req: Request): Promise<GetUserReservationsResult[]> {
    return this.queryBus.execute(new GetUserReservationsQuery(req.userId!));
  }
}
