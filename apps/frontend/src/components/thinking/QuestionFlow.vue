<template>
  <div
    class="question-flow"
    :class="{ 'no-hover': suppressHover, fresh: freshMount }"
  >
    <!-- 진행 헤더 -->
    <div class="progress-header">
      <div class="progress-info">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <p class="tc-body-text">
          {{ currentQuestionIndex + 1 }}번째 질문 / 총 {{ questions.length }}개
        </p>
      </div>
    </div>

    <!-- 질문 카드 -->
    <TcCard size="lg" class="question-card">
      <template #header>
        <div class="question-header">
          <div class="question-number">Q{{ currentQuestionIndex + 1 }}</div>
          <h3 class="question-text">
            {{ currentQuestion?.text }}
          </h3>
        </div>
      </template>

      <div class="choices-container">
        <div
          v-for="choice in currentQuestion?.choices"
          :key="choice.id"
          class="choice-option"
          :class="{
            selected: selectedChoice === choice.id,
            'choice-a': choice.id === 'A',
            'choice-b': choice.id === 'B',
          }"
          @click="onSelect(choice.id)"
        >
          <div class="choice-label">
            {{ choice.id }}
          </div>
          <div class="choice-content">
            {{ choice.content }}
            <div class="choice-description">- {{ choice.description }}</div>
          </div>
          <div class="choice-indicator">
            <div v-if="selectedChoice === choice.id" class="selected-icon">
              ✓
            </div>
          </div>
        </div>
      </div>
    </TcCard>

    <!-- 분석 중 모달 -->
    <TcDialog
      v-model="isAnalyzing"
      title="🤔 AI가 당신의 답변을 분석 중입니다"
      :closable="true"
      :closeOnBackdrop="false"
      @update:modelValue="onAnalyzeDialogChange"
    >
      <div class="analyzing-content">
        <div class="thinking-animation">
          <div class="thinking-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p class="tc-body-text tc-readable">
          {{ analysisStages[currentAnalysisStage] }}
        </p>
        <div class="analysis-progress">
          <div
            class="analysis-progress-fill"
            :style="{ width: analysisProgress + '%' }"
          ></div>
        </div>
      </div>
    </TcDialog>
  </div>
</template>

<script setup lang="ts">
import { TcCard, TcDialog } from '@/components/ui';
import { useQuestionProgress } from '@/composables';
import type { Question, UserResponse } from '@/types';
import './QuestionFlow.scss';

interface Props {
  questions: Question[];
  initialResponses?: UserResponse[];
}

interface Emits {
  (event: 'complete', responses: UserResponse[]): void;
  (event: 'back'): void;
  (event: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const {
  currentQuestionIndex,
  selectedChoice,
  responses,
  currentQuestion,
  progressPercentage,
  isAnalyzing,
  currentAnalysisStage,
  analysisProgress,
  suppressHover,
  freshMount,
  analysisStages,
  onSelect,
  onAnalyzeDialogChange,
} = useQuestionProgress(props.questions, props.initialResponses || [], {
  onComplete: nextResponses => emit('complete', nextResponses),
  onCancel: () => emit('cancel'),
});
</script>
