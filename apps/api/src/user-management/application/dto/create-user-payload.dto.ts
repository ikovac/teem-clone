import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'user-management/core/entities/user.entity';

export class CreateUserPayload {
  @ApiProperty({ example: 'example@example.org' })
  email: string;
  @ApiProperty({ enum: Role, example: 'user' })
  role: Role;
  @ApiProperty({ example: 'John' })
  firstName: string;
  @ApiProperty({ example: 'Doe' })
  lastName: string;
}
