<template>
  <div
    class="question-flow"
    :class="{ 'no-hover': suppressHover, fresh: freshMount }"
  >
    <!-- Progress Header -->
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

    <!-- Question Card -->
    <TcCard size="lg" class="question-card">
      <template #header>
        <div class="question-header">
          <div class="question-number">Q{{ currentQuestionIndex + 1 }}</div>
          <h3 class="question-text">
            {{ currentQuestion.text }}
          </h3>
        </div>
      </template>

      <div class="choices-container">
        <div
          v-for="choice in currentQuestion.choices"
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

    <!-- Thinking Modal -->
    <TcDialog
      v-model="isAnalyzing"
      title="🤔 AI가 당신의 답변을 분석 중입니다"
      :closable="false"
      :closeOnBackdrop="false"
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
import { useQuestionProgress } from '@/composables/useQuestionProgress';
import type { Question, UserResponse } from '@/types/thinking';
import { onBeforeUnmount, ref, watch } from 'vue';
import './QuestionFlow.scss';

interface Props {
  questions: Question[];
  initialResponses?: UserResponse[];
}

interface Emits {
  (event: 'complete', responses: UserResponse[]): void;
  (event: 'back'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const {
  currentQuestionIndex,
  selectedChoice,
  responses,
  currentQuestion,
  progressPercentage,
  remainingTime,
  isLastQuestion,
  selectChoice,
  goToNextQuestion: goToNextQuestionCore,
  goToPreviousQuestion,
  goToQuestion,
} = useQuestionProgress(props.questions, props.initialResponses || []);

const isAnalyzing = ref<boolean>(false);
const currentAnalysisStage = ref<number>(0);
const analysisProgress = ref<number>(0);
const suppressHover = ref<boolean>(false);
const freshMount = ref<boolean>(false);

const analysisStages = [
  '답변 패턴을 분석하고 있습니다...',
  '성향과 우선순위를 파악하고 있습니다...',
  '최적의 해결책을 찾고 있습니다...',
  '개인화된 행동 가이드를 생성하고 있습니다...',
  '분석 완료! 결과를 준비 중입니다...',
];

const goToNextQuestion = async () => {
  const shouldComplete = await goToNextQuestionCore();
  if (shouldComplete) {
    // Show Thinking Modal while parent runs analyze API
    isAnalyzing.value = true;
    emit('complete', responses.value);
  }
};

// Select and immediately advance
const onSelect = async (choice: 'A' | 'B') => {
  // Play select animation briefly, then advance; suppress hover carry-over
  suppressHover.value = true;
  selectChoice(choice);
  await new Promise(r => setTimeout(r, 180));
  freshMount.value = true; // disable transitions for the next question's first paint
  await goToNextQuestion();
  // allow next DOM paint then re-enable transitions/hover
  setTimeout(() => {
    freshMount.value = false;
    suppressHover.value = false;
  }, 50);
};

// goToPreviousQuestion, goToQuestion are provided by composable

const runAnalysisProgress = async () => {
  // staged animation across analysisStages; do not auto-close
  currentAnalysisStage.value = 0;
  analysisProgress.value = 0;
  const stages = analysisStages.length;
  for (let i = 0; i < stages; i++) {
    if (!isAnalyzing.value) break;
    currentAnalysisStage.value = i;
    const start = (i / stages) * 100;
    const end = ((i + 1) / stages) * 100;
    const duration = 1500; // match ThinkingProcess/QuestionFlow pacing
    const steps = 20;
    const stepDuration = duration / steps;
    const delta = (end - start) / steps;
    for (let j = 0; j < steps; j++) {
      if (!isAnalyzing.value) break;
      await new Promise(r => setTimeout(r, stepDuration));
      analysisProgress.value = Math.min(99, start + delta * (j + 1));
    }
  }
  // hold near-complete if still analyzing
  while (isAnalyzing.value) {
    await new Promise(r => setTimeout(r, 200));
    analysisProgress.value = Math.min(99, analysisProgress.value + 0.3);
  }
};

watch(
  () => isAnalyzing.value,
  active => {
    if (active) runAnalysisProgress();
    else {
      // finalize progress and reset for next time
      analysisProgress.value = 100;
      setTimeout(() => {
        analysisProgress.value = 0;
        currentAnalysisStage.value = 0;
      }, 200);
    }
  }
);

onBeforeUnmount(() => {
  // stop loops on unmount
  isAnalyzing.value = false;
});
</script>
