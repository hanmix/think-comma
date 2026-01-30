import dotenv from 'dotenv';
import { EnvSchema } from '../schemas/env';

dotenv.config();

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map(i => `${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = {
  OPENAI_API_KEY: parsed.data.OPENAI_API_KEY,
  OPENAI_BASE_URL: parsed.data.OPENAI_BASE_URL,
  OPENAI_MODEL: parsed.data.OPENAI_MODEL,
  TIMEOUT_MS: parsed.data.TIMEOUT_MS ? Number(parsed.data.TIMEOUT_MS) : 60000,
  CORS_ORIGIN: parsed.data.CORS_ORIGIN,
};
