import { z } from 'zod';

export const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  OPENAI_MODEL: z.string().optional().default('gpt-5.2'),
  TIMEOUT_MS: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
});
