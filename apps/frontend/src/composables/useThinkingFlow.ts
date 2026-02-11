import { FlowRoute, ProcessStep, RequestKey } from '@/constants/thinking';
import { aiClient } from '@/services/aiClient';
import { useNavStackStore } from '@/stores/navStack';
import { useThinkingStore } from '@/stores/thinking';
import type {
  FlowRouteType,
  ProcessStepType,
  RequestKeyType,
  UserResponse,
  WorryInput,
} from '@/types';
import { getErrorMessage, toApiError } from '@/utils';
import axios from 'axios';
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

  const requestControllers = new Map<RequestKeyType, AbortController>();
  const requestTokens = new Map<RequestKeyType, number>();

  const startRequest = (key: RequestKeyType) => {
    requestControllers.get(key)?.abort();
    const controller = new AbortController();
    requestControllers.set(key, controller);
    const token = (requestTokens.get(key) ?? 0) + 1;
    requestTokens.set(key, token);
    return { controller, token };
  };

  const finishRequest = (key: RequestKeyType, token: number) => {
    if (requestTokens.get(key) !== token) return;
    requestControllers.delete(key);
  };

  const cancelRequest = (key: RequestKeyType) => {
    requestControllers.get(key)?.abort();
    requestControllers.delete(key);
    requestTokens.set(key, (requestTokens.get(key) ?? 0) + 1);
  };

  const getRequestKeyForStep = (step: ProcessStepType) => {
    switch (step) {
      case ProcessStep.Input:
        return RequestKey.Framing;
      case ProcessStep.Intro:
        return RequestKey.Questions;
      case ProcessStep.Questions:
        return RequestKey.Analysis;
    }
    return null;
  };

  const isCanceledError = (err: unknown) =>
    axios.isAxiosError(err) && err.code === 'ERR_CANCELED';

  const navigateToStep = (step: FlowRouteType) => {
    if (router.currentRoute.value.name !== step) {
      router.push({ name: step });
    }
  };

  const handleWorrySubmit = async (worry: WorryInput) => {
    if (isWorrySubmitInFlight) return;
    isWorrySubmitInFlight = true;
    const { controller, token } = startRequest(RequestKey.Framing);
    try {
      setWorryInput(worry);
      setLoading(true, 'AI가 고민을 구조화하고 있어요...');
      const { framing, contextId } = await aiClient.generateFraming(worry, {
        signal: controller.signal,
      });
      if (
        controller.signal.aborted ||
        requestTokens.get(RequestKey.Framing) !== token
      )
        return;
      setContextId(contextId);
      setFramingIntro(framing);
      navigateToStep(FlowRoute.Intro);
    } catch (err) {
      if (isCanceledError(err)) return;
      const apiErr = toApiError(err);
      setError(
        getErrorMessage(
          apiErr?.code,
          '초기 구성 중 오류가 발생했습니다. 다시 시도해주세요.'
        )
      );
      console.error('Intro framing error:', err);
    } finally {
      if (requestTokens.get(RequestKey.Framing) === token) {
        setLoading(false);
        isWorrySubmitInFlight = false;
      }
      finishRequest(RequestKey.Framing, token);
    }
  };

  const startQuestions = async () => {
    if (isQuestionStartInFlight) return;
    isQuestionStartInFlight = true;
    const { controller, token } = startRequest(RequestKey.Questions);
    try {
      if (!state.worryInput) throw new Error('고민 정보가 없습니다.');
      if (!state.contextId) throw new Error('contextId가 없습니다.');
      setLoading(true, 'AI가 질문을 준비하고 있습니다...');
      const generatedQuestions = await aiClient.generateQuestions(
        state.worryInput,
        state.framingIntro?.axis,
        { signal: controller.signal }
      );
      if (
        controller.signal.aborted ||
        requestTokens.get(RequestKey.Questions) !== token
      )
        return;
      setQuestions(generatedQuestions);
      navigateToStep(RequestKey.Questions);
    } catch (err) {
      if (isCanceledError(err)) return;
      const apiErr = toApiError(err);
      setError(
        getErrorMessage(
          apiErr?.code,
          '질문 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
        )
      );
      console.error('Question generation error:', err);
    } finally {
      if (requestTokens.get(RequestKey.Questions) === token) {
        setLoading(false);
        isQuestionStartInFlight = false;
      }
      finishRequest(RequestKey.Questions, token);
    }
  };

  const handleQuestionsComplete = async (userResponses: UserResponse[]) => {
    if (isAnalysisInFlight) return;
    isAnalysisInFlight = true;
    const { controller, token } = startRequest(RequestKey.Analysis);
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
        state.framingIntro?.axis,
        { signal: controller.signal }
      );

      if (
        controller.signal.aborted ||
        requestTokens.get(RequestKey.Analysis) !== token
      )
        return;
      setAnalysisResult(result);
      navigateToStep('result');
    } catch (err) {
      if (isCanceledError(err)) return;
      const apiErr = toApiError(err);
      setError(
        getErrorMessage(
          apiErr?.code,
          '분석 중 오류가 발생했습니다. 다시 시도해주세요.'
        )
      );
      console.error('Analysis generation error:', err);
    } finally {
      if (requestTokens.get(RequestKey.Analysis) === token) {
        setLoading(false);
        isAnalysisInFlight = false;
      }
      finishRequest(RequestKey.Analysis, token);
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

  const restartProcess = (step: FlowRouteType = 'input') => {
    reset();
    navStore.requestSkipConfirm();
    navigateToStep(step);
  };

  const cancelCurrentStep = () => {
    const key = getRequestKeyForStep(state.currentStep);
    if (!key) return;
    cancelRequest(key);
    setLoading(false);
    if (key === RequestKey.Framing) isWorrySubmitInFlight = false;
    if (key === RequestKey.Questions) isQuestionStartInFlight = false;
    if (key === RequestKey.Analysis) isAnalysisInFlight = false;
  };

  return {
    state,
    currentSession,
    goToStep: (step: FlowRouteType) => navigateToStep(step),
    handleWorrySubmit,
    startQuestions,
    handleQuestionsComplete,
    retryCurrentStep,
    restartProcess,
    cancelCurrentStep,
  };
}
