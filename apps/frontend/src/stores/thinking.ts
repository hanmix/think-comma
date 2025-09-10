import type {
  AnalysisResult as AnalysisResultType,
  Question,
  ThinkingSession,
  UserResponse,
  WorryInput as WorryInputType,
} from '@/types/thinking';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

export type ProcessStep = 'input' | 'intro' | 'questions' | 'result';

/**
 * 고민/질문/분석 플로우 상태 스토어 (Pinia / Setup Store)
 * - state: 진행 단계, 로딩/에러, 세션/입력/질문/응답/결과
 * - currentSession: 현재 세션 스냅샷(computed)
 * - reset: 플로우 초기화 액션
 */
export const useThinkingStore = defineStore('thinking', () => {
  const state = reactive({
    currentStep: 'input' as ProcessStep,
    isLoading: false,
    error: '' as string,
    loadingMessage: '' as string,

    sessionId: '' as string,
    worryInput: null as WorryInputType | null,
    questions: [] as Question[],
    responses: [] as UserResponse[],
    analysisResult: null as AnalysisResultType | null,
    framingIntro: null as import('@/types/thinking').FramingIntro | null,
  });

  const currentSession = computed<Partial<ThinkingSession>>(() => ({
    id: state.sessionId,
    worry: state.worryInput || undefined,
    questions: state.questions,
    responses: state.responses,
    result: state.analysisResult || undefined,
    createdAt: new Date(),
    completedAt: state.analysisResult ? new Date() : undefined,
  }));

  const reset = () => {
    state.currentStep = 'input';
    state.isLoading = false;
    state.error = '';
    state.loadingMessage = '';
    state.sessionId = '';
    state.worryInput = null;
    state.questions = [];
    state.responses = [];
    state.analysisResult = null;
    state.framingIntro = null;
  };

  return { state, currentSession, reset };
});
