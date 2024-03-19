import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const mailSchema = z.object({
  from: z.string(),
  host: z.string(),
  port: z.coerce.number(),
  username: z.string(),
  password: z.string(),
});

export default registerAs('mail', () => {
  const config = mailSchema.parse({
    from: process.env.MAIL_FROM,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
  });
  return config;
});
