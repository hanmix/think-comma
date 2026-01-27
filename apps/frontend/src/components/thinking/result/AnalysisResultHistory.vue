<template>
  <div>
    <div class="history-toggle">
      <TcButton variant="outline" size="lg" @click="toggleChoiceHistory">
        📋 {{ showHistory ? '선택 과정 숨기기' : '내 선택 과정 보기' }}
      </TcButton>
    </div>

    <TcCard v-if="showHistory" class="choice-history">
      <template #header>
        <h3>📝 당신이 선택한 답변들</h3>
      </template>

      <div class="history-list">
        <div
          v-for="response in result.responses"
          :key="response.questionId"
          class="history-item"
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
    </TcCard>
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard } from '@/components/ui';
import type { AnalysisResult, Question } from '@/types';
import { ref } from 'vue';

const props = defineProps<{
  result: AnalysisResult;
  questions?: Question[];
}>();

const showHistory = ref<boolean>(false);

const toggleChoiceHistory = () => {
  showHistory.value = !showHistory.value;
};

function getQuestionText(id: number) {
  const q = props.questions?.find(q => q.id === id);
  if (q) return `${q.text}`;
}
</script>
