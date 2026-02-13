import type { ProcessStepType } from '@/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * 네비게이션 상태 스토어 (Pinia / Setup Store)
 * - 목적: Flow 진행 상태와 현재 단계 추적
 */

export const useNavStackStore = defineStore('navStack', () => {
  const flowStep = ref<ProcessStepType>('input');
  const isFlowInProgress = computed(() => flowStep.value !== 'input');
  const skipConfirmNext = ref(false);

  const setFlowStep = (step: ProcessStepType) => {
    flowStep.value = step;
  };

  const resetFlow = () => {
    flowStep.value = 'input';
  };

  const requestSkipConfirm = () => {
    skipConfirmNext.value = true;
  };

  const consumeSkipConfirm = () => {
    const value = skipConfirmNext.value;
    skipConfirmNext.value = false;
    return value;
  };

  return {
    flowStep,
    isFlowInProgress,
    setFlowStep,
    resetFlow,
    requestSkipConfirm,
    consumeSkipConfirm,
  };
});
