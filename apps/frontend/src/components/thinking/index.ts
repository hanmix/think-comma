// ThinkComma Thinking 컴포넌트

export { default as AnalysisResult } from './AnalysisResult.vue';
export { default as QuestionFlow } from './QuestionFlow.vue';
export { default as ThinkingProcess } from './ThinkingProcess.vue';
export { default as WorryInput } from './WorryInput.vue';

// 타입 재export
export type {
  AnalysisResult as AnalysisResultType,
  DecisionFactor,
  PersonalityTrait,
  Question,
  ThinkingSession,
  UserResponse,
  WorryInput as WorryInputType,
} from '@/types';
