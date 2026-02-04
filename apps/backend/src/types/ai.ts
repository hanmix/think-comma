import { AnalysisAIResponseSchema } from '@modules/analysis/analysis.schemas';
import { FramingAIResponseSchema } from '@modules/framing/framing.schemas';
import { AIQuestionsSchema } from '@modules/questions/questions.schemas';
import type { z } from 'zod';

export type FramingAIResponse = z.infer<typeof FramingAIResponseSchema>;
export type AnalysisAIResponse = z.infer<typeof AnalysisAIResponseSchema>;
export type AIQuestionsResponse = z.infer<typeof AIQuestionsSchema>;

export type ChoiceA = { id: 'A'; content: string; description?: string };
export type ChoiceB = { id: 'B'; content: string; description?: string };

export type NormalizedAIQuestion = {
  id: number; // Q번호: 1~10
  text: string;
  choices: [ChoiceA, ChoiceB];
};

export type NormalizedAIQuestionsResponse = {
  questions: NormalizedAIQuestion[];
};

export type AIQuestionAnswer = {
  questionId: number; // 1~10
  answer: 'A' | 'B';
};
