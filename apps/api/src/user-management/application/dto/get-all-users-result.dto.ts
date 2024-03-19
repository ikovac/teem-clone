import { IQueryResult } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'user-management/core/entities/user.entity';

export class GetAllUsersResult implements IQueryResult {
  @ApiProperty()
  data: UserData[];

  @ApiProperty()
  count: number;
}

class UserData {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 'example@example.org' })
  email: string;
  @ApiProperty({ enum: Role, example: 'user' })
  role: Role;
  @ApiProperty({ example: 'John' })
  firstName: string;
  @ApiProperty({ example: 'Doe' })
  lastName: string;
}
