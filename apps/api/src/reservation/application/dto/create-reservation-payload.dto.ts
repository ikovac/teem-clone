import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationPayload {
  @ApiProperty()
  reservationItemId: string;
  @ApiProperty()
  startDate: Date;
  @ApiProperty()
  endDate: Date;
}
