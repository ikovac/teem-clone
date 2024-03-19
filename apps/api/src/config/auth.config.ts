import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const authSchema = z.object({
  domain: z.string(),
  audience: z.string(),
  connection: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  managementApiIdentifier: z.string(),
});

export default registerAs('auth', () => {
  const config = authSchema.parse({
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_API_IDENTIFIER,
    connection: 'Username-Password-Authentication',
    clientId: process.env.AUTH0_M2M_CLIENT_ID,
    clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
    managementApiIdentifier: process.env.AUTH0_MANAGEMENT_API_IDENTIFIER,
  });
  return config;
});
