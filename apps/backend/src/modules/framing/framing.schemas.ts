import { z } from 'zod';

export const FramingAIResponseSchema = z.object({
  choiceALabel: z.string(),
  choiceBLabel: z.string(),
  aHint: z.string(),
  bHint: z.string(),
});

export const AxisAIResponseSchema = z.object({
  axisA: z.string(),
  axisB: z.string(),
  rationaleA: z.string(),
  rationaleB: z.string(),
  keywords: z.array(z.string()).optional(),
});
