import { z } from 'zod';

export const WorrySchema = z.object({
  content: z.string().min(1),
  category: z.string().optional(),
});

export const ChoiceSchema = z.object({
  id: z.enum(['A', 'B']),
  content: z.string(),
});

export const QuestionSchema = z.object({
  id: z.number(),
  text: z.string(),
  choices: z.array(ChoiceSchema),
});

export const ResponseSchema = z.object({
  questionId: z.number(),
  answer: z.enum(['A', 'B']),
});

export const LabelsSchema = z
  .object({
    choiceALabel: z.string().optional(),
    choiceBLabel: z.string().optional(),
  })
  .optional();
