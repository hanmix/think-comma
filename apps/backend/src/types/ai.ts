import type { z } from 'zod';
import { AnalysisAIResponseSchema } from '@modules/analysis/analysis.schemas';
import { AIQuestionsSchema } from '@modules/questions/questions.schemas';
import { FramingAIResponseSchema } from '@modules/framing/framing.schemas';

export type FramingAIResponse = z.infer<typeof FramingAIResponseSchema>;
export type AnalysisAIResponse = z.infer<typeof AnalysisAIResponseSchema>;
export type AIQuestionsResponse = z.infer<typeof AIQuestionsSchema>;
