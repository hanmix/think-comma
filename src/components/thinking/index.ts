// ThinkComma Thinking Components

export { default as WorryInput } from './WorryInput.vue';
export { default as QuestionFlow } from './QuestionFlow.vue';
export { default as AnalysisResult } from './AnalysisResult.vue';
export { default as ThinkingProcess } from './ThinkingProcess.vue';

// Re-export types
export type {
  WorryInput as WorryInputType,
  Question,
  UserResponse,
  PersonalityTrait,
  DecisionFactor,
  AnalysisResult as AnalysisResultType,
  ThinkingSession
} from '@/types/thinking';