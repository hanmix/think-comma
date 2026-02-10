import { aiClient } from '@/services/aiClient';
import { useNavStackStore } from '@/stores/navStack';
import { useThinkingStore } from '@/stores/thinking';
import type { UserResponse, WorryInput } from '@/types';
import { getErrorMessage, toApiError } from '@/utils';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

export function useThinkingFlow() {
  const store = useThinkingStore();
  const { currentSession } = storeToRefs(store);
  const state = store.state;
  const router = useRouter();
  const navStore = useNavStackStore();
  const {
    reset,
    setLoading,
    setError,
    setContextId,
    setWorryInput,
    setFramingIntro,
    setQuestions,
    setResponses,
    setAnalysisResult,
  } = store;

  // 빠른 연타로 인한 중복 API 호출을 막기 위한 가드
  let isWorrySubmitInFlight = false;
  // 질문 생성 요청이 진행 중일 때 재호출을 막기 위한 가드
  let isQuestionStartInFlight = false;
  // 분석 요청이 진행 중일 때 중복 실행을 막기 위한 가드
  let isAnalysisInFlight = false;

  const flowRoutes = {
    input: 'flow-input',
    intro: 'flow-intro',
    questions: 'flow-questions',
    result: 'flow-result',
  } as const;

  const navigateToStep = (step: keyof typeof flowRoutes) => {
    const target = flowRoutes[step];
    if (router.currentRoute.value.name !== target) {
      router.push({ name: target });
    }
  };

  const handleWorrySubmit = async (worry: WorryInput) => {
    if (isWorrySubmitInFlight) return;
    isWorrySubmitInFlight = true;
    try {
      setWorryInput(worry);
      setLoading(true, 'AI가 고민을 구조화하고 있어요...');
      const { framing, contextId } = await aiClient.generateFraming(worry);
      setContextId(contextId);
      setFramingIntro(framing);
      navigateToStep('intro');
    } catch (err) {
      const apiErr = toApiError(err);
      setError(
        getErrorMessage(
          apiErr?.code,
          '초기 구성 중 오류가 발생했습니다. 다시 시도해주세요.'
        )
      );
      console.error('Intro framing error:', err);
    } finally {
      setLoading(false);
      isWorrySubmitInFlight = false;
    }
  };

  const startQuestions = async () => {
    if (isQuestionStartInFlight) return;
    isQuestionStartInFlight = true;
    try {
      if (!state.worryInput) throw new Error('고민 정보가 없습니다.');
      if (!state.contextId) throw new Error('contextId가 없습니다.');
      setLoading(true, 'AI가 질문을 준비하고 있습니다...');
      const generatedQuestions = await aiClient.generateQuestions(
        state.worryInput,
        state.framingIntro?.axis
      );
      setQuestions(generatedQuestions);
      navigateToStep('questions');
    } catch (err) {
      const apiErr = toApiError(err);
      setError(
        getErrorMessage(
          apiErr?.code,
          '질문 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
        )
      );
      console.error('Question generation error:', err);
    } finally {
      setLoading(false);
      isQuestionStartInFlight = false;
    }
  };

  const handleQuestionsComplete = async (userResponses: UserResponse[]) => {
    if (isAnalysisInFlight) return;
    isAnalysisInFlight = true;
    try {
      setLoading(true, 'AI가 당신의 답변을 종합 분석하고 있습니다...');
      setResponses(userResponses);

      if (!state.worryInput) throw new Error('고민 정보를 찾을 수 없습니다.');
      if (!state.contextId) throw new Error('contextId가 없습니다.');

      const result = await aiClient.generateAnalysis(
        state.worryInput,
        state.questions,
        userResponses,
        {
          choiceALabel: state.framingIntro?.choiceALabel,
          choiceBLabel: state.framingIntro?.choiceBLabel,
        },
        state.framingIntro?.axis
      );

      setAnalysisResult(result);
      navigateToStep('result');
    } catch (err) {
      const apiErr = toApiError(err);
      setError(
        getErrorMessage(
          apiErr?.code,
          '분석 중 오류가 발생했습니다. 다시 시도해주세요.'
        )
      );
      console.error('Analysis generation error:', err);
    } finally {
      setLoading(false);
      isAnalysisInFlight = false;
    }
  };

  const retryCurrentStep = () => {
    setError('');
    switch (state.currentStep) {
      case 'input':
        if (state.worryInput) {
          handleWorrySubmit(state.worryInput);
        } else {
          navigateToStep('input');
        }
        break;
      case 'intro':
        if (!state.worryInput) {
          navigateToStep('input');
        } else if (!state.framingIntro) {
          handleWorrySubmit(state.worryInput);
        } else {
          startQuestions();
        }
        break;
      case 'questions':
        if (state.worryInput && state.responses.length > 0) {
          handleQuestionsComplete(state.responses);
        } else {
          startQuestions();
        }
        break;
      case 'result':
        if (state.worryInput && state.responses.length > 0) {
          handleQuestionsComplete(state.responses);
        }
        break;
    }
  };

  const restartProcess = (step: keyof typeof flowRoutes = 'input') => {
    reset();
    navStore.requestSkipConfirm();
    navigateToStep(step);
  };

  return {
    state,
    currentSession,
    goToStep: (step: keyof typeof flowRoutes) => navigateToStep(step),
    handleWorrySubmit,
    startQuestions,
    handleQuestionsComplete,
    retryCurrentStep,
    restartProcess,
  };
}
