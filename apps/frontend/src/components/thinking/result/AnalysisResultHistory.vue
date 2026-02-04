<template>
  <TcModal v-model="proxyValue" width="50vw" class="choice-history">
    <template #header>
      <h3>📝 당신이 선택한 답변들</h3>
    </template>

    <div class="history-list">
      <div
        v-for="response in result.responses"
        :key="response.questionId"
        class="history-item"
        :class="{
          'history-item--a': response.selectedChoice === 'A',
          'history-item--b': response.selectedChoice === 'B',
        }"
      >
        <div class="history-number">Q{{ response.questionId }}</div>
        <div class="history-content">
          <p class="history-question">
            {{ getQuestionText(response.questionId) }}
          </p>
          <div class="history-choice">
            <span
              class="choice-badge"
              :class="`choice-${response.selectedChoice.toLowerCase()}`"
            >
              {{ response.selectedChoice }}
            </span>
            <span class="choice-text">{{ response.choiceContent }}</span>
          </div>
        </div>
      </div>
    </div>
  </TcModal>
</template>

<script setup lang="ts">
import { TcModal } from '@/components/ui';
import type { AnalysisResult, Question } from '@/types';
import { computed } from 'vue';

const props = defineProps<{
  result: AnalysisResult;
  questions?: Question[];
  modelValue: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const proxyValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

function getQuestionText(id: number) {
  const q = props.questions?.find(q => q.id === id);
  if (q) return `${q.text}`;
}
</script>
