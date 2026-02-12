import { FlowRoute, ProcessStep, RequestKey } from '@/constants';
import { aiClient } from '@/services/aiClient';
import { useNavStackStore, useThinkingStore } from '@/stores';
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
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const GENERATION_STAGES = [
  '고민의 핵심을 파악하고 있습니다...',
  '맥락과 우선순위를 정리하고 있습니다...',
  '맞춤형 질문 후보를 생성하고 있습니다...',
  '질문의 흐름과 난이도를 구성하고 있습니다...',
  '완성 중입니다... 곧 시작할게요!',
] as const;

const PROGRESS_STAGE_DURATION_MS = 1500;
const PROGRESS_STEPS = 20;
const PROGRESS_RESET_DELAY_MS = 300;

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

  // request control
  const requestControllers = new Map<RequestKeyType, AbortController>();
  const requestTokens = new Map<RequestKeyType, number>();
  const inFlight = {
    [RequestKey.Framing]: false,
    [RequestKey.Questions]: false,
    [RequestKey.Analysis]: false,
  };

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

  const isCanceledError = (err: unknown) =>
    axios.isAxiosError(err) && err.code === 'ERR_CANCELED';

  const isRequestStale = (
    key: RequestKeyType,
    token: number,
    controller: AbortController
  ) => controller.signal.aborted || requestTokens.get(key) !== token;

  const withInFlightRequest = async (
    key: RequestKeyType,
    loadingMessage: string,
    run: (ctx: { controller: AbortController; token: number }) => Promise<void>,
    fallbackErrorMessage: string,
    errorLogLabel: string
  ) => {
    if (inFlight[key]) return;
    inFlight[key] = true;
    const { controller, token } = startRequest(key);
    try {
      setLoading(true, loadingMessage);
      await run({ controller, token });
    } catch (err) {
      if (isCanceledError(err)) return;
      const apiErr = toApiError(err);
      setError(getErrorMessage(apiErr?.code, fallbackErrorMessage));
      console.error(`${errorLogLabel}:`, err);
    } finally {
      if (requestTokens.get(key) === token) {
        setLoading(false);
        inFlight[key] = false;
      }
      finishRequest(key, token);
    }
  };

  // route/step helpers
  const navigateToStep = (step: FlowRouteType) => {
    if (router.currentRoute.value.name !== step) {
      router.push({ name: step });
    }
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

  // flow actions
  const handleWorrySubmit = async (worry: WorryInput) => {
    await withInFlightRequest(
      RequestKey.Framing,
      'AI가 고민을 구조화하고 있어요...',
      async ({ controller, token }) => {
        setWorryInput(worry);
        const { framing, contextId } = await aiClient.generateFraming(worry, {
          signal: controller.signal,
        });
        if (isRequestStale(RequestKey.Framing, token, controller)) return;
        setContextId(contextId);
        setFramingIntro(framing);
        navigateToStep(FlowRoute.Intro);
      },
      '초기 구성 중 오류가 발생했습니다. 다시 시도해주세요.',
      'Intro framing error'
    );
  };

  const startQuestions = async () => {
    await withInFlightRequest(
      RequestKey.Questions,
      'AI가 질문을 준비하고 있습니다...',
      async ({ controller, token }) => {
        if (!state.worryInput) throw new Error('고민 정보가 없습니다.');
        if (!state.contextId) throw new Error('contextId가 없습니다.');
        const generatedQuestions = await aiClient.generateQuestions(
          state.worryInput,
          state.framingIntro?.axis,
          { signal: controller.signal }
        );
        if (isRequestStale(RequestKey.Questions, token, controller)) return;
        setQuestions(generatedQuestions);
        navigateToStep(RequestKey.Questions);
      },
      '질문 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
      'Question generation error'
    );
  };

  const handleQuestionsComplete = async (userResponses: UserResponse[]) => {
    await withInFlightRequest(
      RequestKey.Analysis,
      'AI가 당신의 답변을 종합 분석하고 있습니다...',
      async ({ controller, token }) => {
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

        if (isRequestStale(RequestKey.Analysis, token, controller)) return;
        setAnalysisResult(result);
        navigateToStep(FlowRoute.Result);
      },
      '분석 중 오류가 발생했습니다. 다시 시도해주세요.',
      'Analysis generation error'
    );
  };

  const retryCurrentStep = () => {
    setError('');
    const retryByStep: Record<ProcessStepType, () => void> = {
      [ProcessStep.Input]: () => {
        if (state.worryInput) {
          void handleWorrySubmit(state.worryInput);
          return;
        }
        navigateToStep(FlowRoute.Input);
      },
      [ProcessStep.Intro]: () => {
        if (!state.worryInput) {
          navigateToStep(FlowRoute.Input);
          return;
        }
        if (!state.framingIntro) {
          void handleWorrySubmit(state.worryInput);
          return;
        }
        void startQuestions();
      },
      [ProcessStep.Questions]: () => {
        if (state.worryInput && state.responses.length > 0) {
          void handleQuestionsComplete(state.responses);
          return;
        }
        void startQuestions();
      },
      [ProcessStep.Result]: () => {
        if (state.worryInput && state.responses.length > 0) {
          void handleQuestionsComplete(state.responses);
        }
      },
    };
    retryByStep[state.currentStep]();
  };

  const restartProcess = (step: FlowRouteType = FlowRoute.Input) => {
    reset();
    navStore.requestSkipConfirm();
    navigateToStep(step);
  };

  const cancelCurrentStep = () => {
    const key = getRequestKeyForStep(state.currentStep);
    if (!key) return;
    cancelRequest(key);
    setLoading(false);
    inFlight[key] = false;
  };

  // loading UI progress
  const genStageIndex = ref<number>(0);
  const genProgress = ref<number>(0);
  const genStages = GENERATION_STAGES;
  const isGeneratingDialogActive = computed(
    () =>
      state.isLoading &&
      (state.currentStep === ProcessStep.Input ||
        state.currentStep === ProcessStep.Intro)
  );

  const startGeneratingProgress = async () => {
    genStageIndex.value = 0;
    genProgress.value = 0;
    const totalStages = genStages.length;
    for (let i = 0; i < totalStages; i++) {
      if (!isGeneratingDialogActive.value) break;
      genStageIndex.value = i;
      const start = (i / totalStages) * 100;
      const end = ((i + 1) / totalStages) * 100;
      const stepDuration = PROGRESS_STAGE_DURATION_MS / PROGRESS_STEPS;
      const stepDelta = (end - start) / PROGRESS_STEPS;
      for (let j = 0; j < PROGRESS_STEPS; j++) {
        if (!isGeneratingDialogActive.value) break;
        await new Promise(r => setTimeout(r, stepDuration));
        genProgress.value = Math.min(99, start + stepDelta * (j + 1));
      }
    }
  };

  const stopGeneratingProgress = () => {
    genProgress.value = 100;
    setTimeout(() => {
      genProgress.value = 0;
      genStageIndex.value = 0;
    }, PROGRESS_RESET_DELAY_MS);
  };

  const onLoadingDialogChange = (open: boolean) => {
    if (!open) cancelCurrentStep();
  };

  // bindings
  const tryAutoStart = (
    autoStart?: boolean,
    initialWorry?: WorryInput | null
  ) => {
    if (
      autoStart &&
      initialWorry &&
      state.currentStep === ProcessStep.Input &&
      !state.isLoading
    ) {
      void handleWorrySubmit(initialWorry);
    }
  };

  const bindAutoStart = (params: {
    autoStart?: () => boolean | undefined;
    initialWorry?: () => WorryInput | null | undefined;
  }) => {
    const run = () =>
      tryAutoStart(params.autoStart?.(), params.initialWorry?.());
    onMounted(() => {
      run();
    });
    watch(() => [params.autoStart?.(), params.initialWorry?.()], run);
  };

  watch(
    () => isGeneratingDialogActive.value,
    active => {
      if (active) {
        void startGeneratingProgress();
        return;
      }
      stopGeneratingProgress();
    }
  );

  return {
    state,
    currentSession,
    genStages,
    genStageIndex,
    genProgress,
    isGeneratingDialogActive,
    goToStep: (step: FlowRouteType) => navigateToStep(step),
    handleWorrySubmit,
    startQuestions,
    handleQuestionsComplete,
    retryCurrentStep,
    restartProcess,
    cancelCurrentStep,
    onLoadingDialogChange,
    tryAutoStart,
    bindAutoStart,
  };
}
