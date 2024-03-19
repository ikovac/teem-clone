import { IQueryResult } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserResult implements IQueryResult {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 'example@example.org' })
  email: string;
  @ApiProperty({ example: 'John' })
  firstName: string;
  @ApiProperty({ example: 'Doe' })
  lastName: string;
}
