import type {
  AnalysisResult,
  FramingIntro,
  ProcessStep,
  Question,
  ThinkingSession,
  ThinkingState,
  UserResponse,
  WorryInput,
} from '@/types';
import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';

/**
 * 고민/질문/분석 플로우 상태 스토어 (Pinia / Setup Store)
 * - state: 진행 단계, 로딩/에러, 세션/입력/질문/응답/결과
 * - currentSession: 현재 세션 스냅샷(computed)
 * - reset: 플로우 초기화 액션
 */
export const useThinkingStore = defineStore('thinking', () => {
  const state = reactive<ThinkingState>({
    currentStep: 'input',
    isLoading: false,
    error: '',
    loadingMessage: '',
    contextId: '',
    worryInput: null,
    questions: [],
    responses: [],
    analysisResult: null,
    framingIntro: null,
  });

  const currentSession = computed<Partial<ThinkingSession>>(() => ({
    contextId: state.contextId,
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
    state.contextId = '';
    state.worryInput = null;
    state.questions = [];
    state.responses = [];
    state.analysisResult = null;
    state.framingIntro = null;
  };

  const goToStep = (step: ProcessStep) => {
    state.currentStep = step;
    state.error = '';
  };

  const setLoading = (isLoading: boolean, message = '') => {
    state.isLoading = isLoading;
    state.loadingMessage = isLoading ? message : '';
  };

  const setError = (message: string) => {
    state.error = message;
  };

  const setContextId = (contextId: string) => {
    state.contextId = contextId;
  };

  const setWorryInput = (worry: WorryInput | null) => {
    state.worryInput = worry;
  };

  const setFramingIntro = (framing: FramingIntro | null) => {
    state.framingIntro = framing;
  };

  const setQuestions = (questions: Question[]) => {
    state.questions = questions;
  };

  const setResponses = (responses: UserResponse[]) => {
    state.responses = responses;
  };

  const setAnalysisResult = (result: AnalysisResult | null) => {
    state.analysisResult = result;
  };

  return {
    state,
    currentSession,
    reset,
    goToStep,
    setLoading,
    setError,
    setContextId,
    setWorryInput,
    setFramingIntro,
    setQuestions,
    setResponses,
    setAnalysisResult,
  };
});
