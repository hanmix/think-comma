import { z } from 'zod';

export const AIQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string(),
        choices: z
          .array(
            z.object({
              id: z.enum(['A', 'B']),
              content: z.string(),
              description: z.string().optional(),
            })
          )
          .length(2),
      })
    )
    .min(1),
});
