import { z } from 'zod';

export const FramingAIResponseSchema = z.object({
  summary: z.string(),
  choiceALabel: z.string(),
  choiceBLabel: z.string(),
  aHint: z.string(),
  bHint: z.string(),
  cta: z.string(),
});
