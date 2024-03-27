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
import { InventoryService } from '../../application/inventory.service';
import {
  PaginationInterceptor,
  PaginationQuery,
} from 'shared/pagination.interceptor';
import { Request } from 'express';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'shared/auth/permission.decorator';
import { AuthGuard } from 'shared/auth/auth.guard';
import { GetInventoryItemsQuery } from 'reservation/application/queries/get-inventory-items.query';
import { QueryBus } from '@nestjs/cqrs';

// TODO: Add DTOs for the request and response payloads
@Controller('inventory-items')
@ApiTags('inventory-items')
@ApiBearerAuth('access-token')
export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(WebhookSignatureGuard)
  async create(@Body() body: any) {
    if (body['_type'] === 'location') {
      const dto = {
        cmsId: body._id,
        title: body.title,
        address: body.address,
      };
      await this.inventoryService.upsertLocation(dto);
    }
    if (body['_type'] === 'room') {
      const dto = {
        cmsId: body._id,
        type: 'room',
        title: body.title,
        data: { capacity: body.capacity },
        locationCmsId: body.location._ref,
      };
      await this.inventoryService.upsertInventoryItem(dto);
    }
    if (body['_type'] === 'desk') {
      const dto = {
        cmsId: body._id,
        type: 'desk',
        title: body.title,
        data: { equipment: body.equipment },
        locationCmsId: body.location._ref,
      };
      await this.inventoryService.upsertInventoryItem(dto);
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
