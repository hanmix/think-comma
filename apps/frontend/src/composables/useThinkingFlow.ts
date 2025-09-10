import { aiService } from '@/services/aiService';
import { useThinkingStore, type ProcessStep } from '@/stores/thinking';
import type {
  ThinkingSession,
  UserResponse,
  WorryInput as WorryInputType,
} from '@/types/thinking';
import { storeToRefs } from 'pinia';

export function useThinkingFlow() {
  const store = useThinkingStore();
  const { currentSession } = storeToRefs(store);
  const state = store.state;
  const { reset } = store;

  const generateSessionId = (): string => {
    return `session-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  };

  const goToStep = (step: ProcessStep) => {
    state.currentStep = step;
    state.error = '';
  };

  const handleWorrySubmit = async (worry: WorryInputType) => {
    try {
      state.worryInput = worry;
      state.sessionId = generateSessionId();
      state.isLoading = true;
      state.loadingMessage = 'AI가 고민을 구조화하고 있어요...';
      const framing = await aiService.generateFraming(worry, state.sessionId);
      state.framingIntro = framing;
      state.currentStep = 'intro';
    } catch (err) {
      state.error = '초기 구성 중 오류가 발생했습니다. 다시 시도해주세요.';
      console.error('Intro framing error:', err);
    } finally {
      state.isLoading = false;
      state.loadingMessage = '';
    }
  };

  const startQuestions = async () => {
    try {
      if (!state.worryInput) throw new Error('고민 정보가 없습니다.');
      state.isLoading = true;
      state.loadingMessage = 'AI가 질문을 준비하고 있습니다...';
      const generatedQuestions = await aiService.generateQuestions(
        state.worryInput
      );
      state.questions = generatedQuestions;
      state.currentStep = 'questions';
    } catch (err) {
      state.error = '질문 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
      console.error('Question generation error:', err);
    } finally {
      state.isLoading = false;
      state.loadingMessage = '';
    }
  };

  const handleQuestionsComplete = async (userResponses: UserResponse[]) => {
    try {
      state.isLoading = true;
      state.loadingMessage = 'AI가 당신의 답변을 종합 분석하고 있습니다...';

      state.responses = userResponses;

      if (!state.worryInput) throw new Error('고민 정보를 찾을 수 없습니다.');

      const result = await aiService.generateAnalysis(
        state.worryInput,
        state.questions,
        userResponses,
        {
          choiceALabel: state.framingIntro?.choiceALabel,
          choiceBLabel: state.framingIntro?.choiceBLabel,
        },
        state.sessionId
      );

      state.analysisResult = result;
      state.currentStep = 'result';
    } catch (err) {
      state.error = '분석 중 오류가 발생했습니다. 다시 시도해주세요.';
      console.error('Analysis generation error:', err);
    } finally {
      state.isLoading = false;
      state.loadingMessage = '';
    }
  };

  const retryCurrentStep = () => {
    state.error = '';
    switch (state.currentStep) {
      case 'input':
        break;
      case 'questions':
        if (state.worryInput) {
          handleWorrySubmit(state.worryInput);
        }
        break;
      case 'result':
        if (state.worryInput && state.responses.length > 0) {
          handleQuestionsComplete(state.responses);
        }
        break;
    }
  };

  const restartProcess = () => {
    reset();
  };

  const saveSession = () => {
    if (state.sessionId && currentSession.value) {
      localStorage.setItem(
        `thinking-session-${state.sessionId}`,
        JSON.stringify(currentSession.value)
      );
    }
  };

  const loadSession = (id: string): Partial<ThinkingSession> | null => {
    try {
      const savedSession = localStorage.getItem(`thinking-session-${id}`);
      return savedSession ? JSON.parse(savedSession) : null;
    } catch (err) {
      console.error('Error loading session:', err);
      return null;
    }
  };

  return {
    state,
    currentSession,
    goToStep,
    handleWorrySubmit,
    startQuestions,
    handleQuestionsComplete,
    retryCurrentStep,
    restartProcess,
    saveSession,
    loadSession,
  };
}
