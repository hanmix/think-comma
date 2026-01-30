import type { z } from 'zod';
import { generateJSON } from '.';

export async function jsonParser<T>(
  prompt: string,
  schema: z.ZodType<T>
): Promise<T> {
  const raw = await generateJSON<unknown>(prompt);
  return schema.parse(raw);
}
