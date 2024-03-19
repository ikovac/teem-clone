import { Injectable } from '@nestjs/common';
import { MailProviderService } from './mail-provider.service';
import { UserManagementIntegration } from './user-management.integration';

@Injectable()
export class NotificationService {
  constructor(
    private mailProvider: MailProviderService,
    private userManagementIntegration: UserManagementIntegration,
  ) {}

  async sendReservationCreatedNotification(payload: {
    reservationItemTitle: string;
    startDate: Date;
    endDate: Date;
    userId: number;
  }) {
    const user = await this.userManagementIntegration.getUserById(
      payload.userId,
    );
    return this.mailProvider.sendMail({
      to: user.email,
      subject: 'Reservation created',
      text: `
        Hello ${user.firstName} ${user.lastName},
        Your reservation for ${payload.reservationItemTitle} has been created.
        Start date: ${payload.startDate}
        End date: ${payload.endDate}
      `,
      html: `
        <div>Hello ${user.firstName} ${user.lastName},</div>
        <strong>Your reservation for ${payload.reservationItemTitle} has been created.</strong>
        <div>Start date: ${payload.startDate}</div>
        <div>End date: ${payload.endDate}</div>
        `,
    });
  }
}
