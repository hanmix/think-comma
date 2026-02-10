import type { Question, UserResponse } from '@/types';
import { computed, nextTick, ref, watch } from 'vue';

export function useQuestionProgress(
  questions: Question[],
  initialResponses: UserResponse[] = []
) {
  const currentQuestionIndex = ref<number>(0);
  const selectedChoice = ref<'A' | 'B' | null>(null);
  const responses = ref<UserResponse[]>([...initialResponses]);

  const currentQuestion = computed(() => questions[currentQuestionIndex.value]);
  const progressPercentage = computed(
    () => ((currentQuestionIndex.value + 1) / questions.length) * 100
  );
  const remainingTime = computed(() =>
    Math.max(
      1,
      Math.ceil((questions.length - currentQuestionIndex.value - 1) * 0.8)
    )
  );
  const isLastQuestion = computed(
    () => currentQuestionIndex.value === questions.length - 1
  );

  // 기존 응답과 선택 상태를 동기화
  watch(
    [currentQuestionIndex, () => responses.value],
    () => {
      const existingResponse = responses.value.find(
        r => r.questionId === currentQuestion.value?.id
      );
      selectedChoice.value = existingResponse?.selectedChoice || null;
    },
    { immediate: true }
  );

  const selectChoice = (choice: 'A' | 'B') => {
    selectedChoice.value = choice;
  };

  const saveCurrentResponse = () => {
    if (!selectedChoice.value) return;
    const choiceContent =
      currentQuestion.value?.choices.find(c => c.id === selectedChoice.value)
        ?.content || '';
    const response: UserResponse = {
      questionId: currentQuestion.value?.id ?? -1,
      selectedChoice: selectedChoice.value,
      choiceContent,
    };
    const existingIndex = responses.value.findIndex(
      r => r.questionId === currentQuestion.value?.id
    );
    if (existingIndex >= 0) responses.value[existingIndex] = response;
    else responses.value.push(response);
  };

  const goToNextQuestion = async () => {
    if (!selectedChoice.value) return false as const;
    // 현재 질문의 선택을 저장
    saveCurrentResponse();
    if (isLastQuestion.value) return true as const;
    // 선택 스타일이 넘어가지 않도록 인덱스 이동 전에 선택을 초기화
    selectedChoice.value = null;
    await nextTick();
    currentQuestionIndex.value++;
    return false as const;
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      saveCurrentResponse();
      currentQuestionIndex.value--;
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      saveCurrentResponse();
      currentQuestionIndex.value = index;
    }
  };

  return {
    // 상태
    currentQuestionIndex,
    selectedChoice,
    responses,
    currentQuestion,
    progressPercentage,
    remainingTime,
    isLastQuestion,
    // 액션
    selectChoice,
    saveCurrentResponse,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
  };
}
