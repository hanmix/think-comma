import type {
  AnalysisResult,
  FramingIntro,
  Question,
  UserResponse,
  WorryInput,
} from '@/types';
import { aiService } from './aiService';

type AiClient = {
  generateQuestions: (
    worry: WorryInput,
    axis?: FramingIntro['axis']
  ) => Promise<Question[]>;
  generateFraming: (
    worry: WorryInput
  ) => Promise<{ framing: FramingIntro; contextId: string }>;
  generateAnalysis: (
    worry: WorryInput,
    questions: Question[],
    responses: UserResponse[],
    labels?: { choiceALabel?: string; choiceBLabel?: string },
    axis?: FramingIntro['axis']
  ) => Promise<AnalysisResult>;
};

export const aiClient: AiClient = aiService;
