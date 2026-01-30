import type { z } from 'zod';
import {
  LabelsSchema,
  QuestionSchema,
  ResponseSchema,
  WorrySchema,
} from '@shared/schemas/api';

export type Worry = z.infer<typeof WorrySchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Response = z.infer<typeof ResponseSchema>;
export type Labels = z.infer<typeof LabelsSchema>;
