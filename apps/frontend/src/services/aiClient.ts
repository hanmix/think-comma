import type {
  AnalysisResult,
  FramingIntro,
  Question,
  UserResponse,
  WorryInput,
} from '@/types';
import { aiService } from './aiService';

type AiClient = {
  generateQuestions: (worry: WorryInput) => Promise<Question[]>;
  generateFraming: (
    worry: WorryInput,
    sessionId?: string
  ) => Promise<FramingIntro>;
  generateAnalysis: (
    worry: WorryInput,
    questions: Question[],
    responses: UserResponse[],
    labels?: { choiceALabel?: string; choiceBLabel?: string },
    sessionId?: string
  ) => Promise<AnalysisResult>;
};

export const aiClient: AiClient = aiService;
