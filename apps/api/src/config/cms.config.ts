import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const cmsSchema = z.object({
  projectId: z.string(),
  webhookSecret: z.string(),
  dataset: z.string(),
  apiToken: z.string(),
});

export default registerAs('cms', () => {
  const config = cmsSchema.parse({
    projectId: process.env.SANITY_PROJECT_ID,
    webhookSecret: process.env.SANITY_WEBHOOK_SECRET,
    dataset: 'production',
    apiToken: process.env.SANITY_API_TOKEN,
  });
  return config;
});
