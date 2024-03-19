import { IQueryResult } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserReservationsResult implements IQueryResult {
  @ApiProperty()
  id: number;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
  @ApiProperty({ example: 'Desk 75' })
  title: string;
}
