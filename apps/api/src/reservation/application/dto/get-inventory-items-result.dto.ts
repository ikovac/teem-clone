import { IQueryResult } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import {
  InventoryData,
  InventoryType,
} from 'reservation/core/entities/inventory-item.entity';

export class GetInventoryItemsResult implements IQueryResult {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: Date;
  @ApiProperty({ example: 'room' })
  type: InventoryType;
  @ApiProperty({
    example: { title: '3rd floor', address: 'Poljicka 43, Split' },
  })
  location: { title: string; address: string };
  @ApiProperty({
    example: { capacity: 6 },
  })
  data: InventoryData;
}
