import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import mailConfig from 'config/mail.config';
import { Transporter, createTransport } from 'nodemailer';

type SendMailPaylod = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailProviderService {
  private transporter: Transporter;

  constructor(
    @Inject(mailConfig.KEY)
    private config: ConfigType<typeof mailConfig>,
  ) {
    const { host, port, username: user, password: pass } = config;

    this.transporter = createTransport({
      host,
      port,
      auth: { user, pass },
    });
  }

  async sendMail({ to, subject, text, html }: SendMailPaylod) {
    return this.transporter.sendMail({
      from: this.config.from,
      to,
      subject,
      text,
      html,
    });
  }
}
