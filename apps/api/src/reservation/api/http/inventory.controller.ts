import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WebhookSignatureGuard } from '../guards/webhook-signature.guard';
import {
  PaginationInterceptor,
  PaginationQuery,
} from 'shared/pagination.interceptor';
import { Request } from 'express';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'shared/auth/permission.decorator';
import { AuthGuard } from 'shared/auth/auth.guard';
import { GetInventoryItemsQuery } from 'reservation/application/queries/get-inventory-items.query';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpsertLocationCommand } from 'reservation/application/commands/upsert-location.command';
import { UpsertInventoryItemCommand } from 'reservation/application/commands/upsert-inventory-items.command';

// TODO: Add DTOs for the request and response payloads
@Controller('inventory-items')
@ApiTags('inventory-items')
@ApiBearerAuth('access-token')
export class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(WebhookSignatureGuard)
  async create(@Body() body: any) {
    if (body['_type'] === 'location') {
      await this.commandBus.execute(
        new UpsertLocationCommand(body._id, body.title, body.address),
      );
    }
    if (body['_type'] === 'room') {
      await this.commandBus.execute(
        new UpsertInventoryItemCommand(
          body._id,
          'room',
          body.title,
          { capacity: body.capacity },
          body.location._ref,
        ),
      );
    }
    if (body['_type'] === 'desk') {
      await this.commandBus.execute(
        new UpsertInventoryItemCommand(
          body._id,
          'desk',
          body.title,
          { equipment: body.equipment },
          body.location._ref,
        ),
      );
    }
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiQuery({ name: 'startDate', required: false, type: 'date' })
  @ApiQuery({ name: 'endDate', required: false, type: 'date' })
  @ApiQuery({ type: PaginationQuery })
  @UseGuards(AuthGuard)
  @Permissions('read:inventory-items')
  getAll(
    @Req() req: Request,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.queryBus.execute(
      new GetInventoryItemsQuery(
        req.pagination,
        startDate && new Date(startDate),
        endDate && new Date(endDate),
      ),
    );
  }
}
