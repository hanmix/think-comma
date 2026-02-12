import type { Question, UserResponse } from '@/types';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

interface QuestionProgressOptions {
  onComplete?: (responses: UserResponse[]) => void;
  onCancel?: () => void;
}

const ANALYSIS_STAGES = [
  '답변 패턴을 분석하고 있습니다...',
  '성향과 우선순위를 파악하고 있습니다...',
  '최적의 해결책을 찾고 있습니다...',
  '개인화된 행동 가이드를 생성하고 있습니다...',
  '분석 완료! 결과를 준비 중입니다...',
] as const;

const SELECTION_DELAY_MS = 180;
const TRANSITION_RESET_DELAY_MS = 50;
const ANALYSIS_STAGE_DURATION_MS = 1500;
const ANALYSIS_STAGE_STEPS = 20;
const ANALYSIS_HOLD_TICK_MS = 200;
const ANALYSIS_RESET_DELAY_MS = 200;
const REMAINING_TIME_PER_QUESTION_MIN = 0.8;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useQuestionProgress(
  questions: Question[],
  initialResponses: UserResponse[] = [],
  options: QuestionProgressOptions = {}
) {
  // state
  const currentQuestionIndex = ref<number>(0);
  const selectedChoice = ref<'A' | 'B' | null>(null);
  const responses = ref<UserResponse[]>([...initialResponses]);
  const isAnalyzing = ref<boolean>(false);
  const currentAnalysisStage = ref<number>(0);
  const analysisProgress = ref<number>(0);
  const suppressHover = ref<boolean>(false);
  const freshMount = ref<boolean>(false);
  let isAdvancing = false;

  // derived state
  const analysisStages = ANALYSIS_STAGES;
  const currentQuestion = computed(() => questions[currentQuestionIndex.value]);
  const progressPercentage = computed(
    () => ((currentQuestionIndex.value + 1) / questions.length) * 100
  );
  const remainingTime = computed(() =>
    Math.max(
      1,
      Math.ceil(
        (questions.length - currentQuestionIndex.value - 1) *
          REMAINING_TIME_PER_QUESTION_MIN
      )
    )
  );
  const isLastQuestion = computed(
    () => currentQuestionIndex.value === questions.length - 1
  );

  // helpers
  const findExistingResponse = (questionId?: number) =>
    responses.value.find(r => r.questionId === questionId);

  const buildCurrentResponse = (): UserResponse | null => {
    if (!selectedChoice.value) return null;
    const questionId = currentQuestion.value?.id ?? -1;
    const choiceContent =
      currentQuestion.value?.choices.find(c => c.id === selectedChoice.value)
        ?.content || '';

    return {
      questionId,
      selectedChoice: selectedChoice.value,
      choiceContent,
    };
  };

  const syncSelectedChoice = () => {
    selectedChoice.value =
      findExistingResponse(currentQuestion.value?.id)?.selectedChoice || null;
  };

  // question actions
  const selectChoice = (choice: 'A' | 'B') => {
    selectedChoice.value = choice;
  };

  const saveCurrentResponse = () => {
    const response = buildCurrentResponse();
    if (!response) return;

    const existingIndex = responses.value.findIndex(
      r => r.questionId === response.questionId
    );

    if (existingIndex >= 0) {
      responses.value[existingIndex] = response;
      return;
    }

    responses.value.push(response);
  };

  const goToNextQuestion = async () => {
    if (!selectedChoice.value) return false as const;
    saveCurrentResponse();
    if (isLastQuestion.value) return true as const;

    selectedChoice.value = null;
    await nextTick();
    currentQuestionIndex.value++;
    return false as const;
  };

  const goToNextQuestionWithComplete = async () => {
    const shouldComplete = await goToNextQuestion();
    if (!shouldComplete) return;
    isAnalyzing.value = true;
    options.onComplete?.(responses.value);
  };

  const onSelect = async (choice: 'A' | 'B') => {
    if (isAdvancing) return;

    isAdvancing = true;
    suppressHover.value = true;
    selectChoice(choice);

    await wait(SELECTION_DELAY_MS);
    freshMount.value = true;
    await goToNextQuestionWithComplete();

    setTimeout(() => {
      freshMount.value = false;
      suppressHover.value = false;
      isAdvancing = false;
    }, TRANSITION_RESET_DELAY_MS);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex.value <= 0) return;
    saveCurrentResponse();
    currentQuestionIndex.value--;
  };

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    saveCurrentResponse();
    currentQuestionIndex.value = index;
  };

  // analysis progress actions
  const onAnalyzeDialogChange = (open: boolean) => {
    if (open) return;
    isAnalyzing.value = false;
    options.onCancel?.();
  };

  const resetAnalysisProgress = () => {
    analysisProgress.value = 100;
    setTimeout(() => {
      analysisProgress.value = 0;
      currentAnalysisStage.value = 0;
    }, ANALYSIS_RESET_DELAY_MS);
  };

  const runAnalysisProgress = async () => {
    currentAnalysisStage.value = 0;
    analysisProgress.value = 0;

    const stageCount = analysisStages.length;
    for (let i = 0; i < stageCount; i++) {
      if (!isAnalyzing.value) break;

      currentAnalysisStage.value = i;
      const start = (i / stageCount) * 100;
      const end = ((i + 1) / stageCount) * 100;
      const stepDuration = ANALYSIS_STAGE_DURATION_MS / ANALYSIS_STAGE_STEPS;
      const stepDelta = (end - start) / ANALYSIS_STAGE_STEPS;

      for (let j = 0; j < ANALYSIS_STAGE_STEPS; j++) {
        if (!isAnalyzing.value) break;
        await wait(stepDuration);
        analysisProgress.value = Math.min(99, start + stepDelta * (j + 1));
      }
    }

    while (isAnalyzing.value) {
      await wait(ANALYSIS_HOLD_TICK_MS);
      analysisProgress.value = Math.min(99, analysisProgress.value + 0.3);
    }
  };

  // effects
  watch([currentQuestionIndex, () => responses.value], syncSelectedChoice, {
    immediate: true,
  });

  watch(
    () => isAnalyzing.value,
    active => {
      if (active) {
        void runAnalysisProgress();
        return;
      }
      resetAnalysisProgress();
    }
  );

  onBeforeUnmount(() => {
    isAnalyzing.value = false;
  });

  return {
    currentQuestionIndex,
    selectedChoice,
    responses,
    currentQuestion,
    progressPercentage,
    remainingTime,
    isLastQuestion,
    isAnalyzing,
    currentAnalysisStage,
    analysisProgress,
    suppressHover,
    freshMount,
    analysisStages,
    selectChoice,
    saveCurrentResponse,
    goToNextQuestion,
    goToNextQuestionWithComplete,
    goToPreviousQuestion,
    goToQuestion,
    onSelect,
    onAnalyzeDialogChange,
  };
}
