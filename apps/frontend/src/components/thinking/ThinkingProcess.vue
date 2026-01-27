<template>
  <div class="thinking-process">
    <!-- Error State -->
    <div v-if="state.error && !state.isLoading" class="error-container">
      <TcCard variant="error" size="lg" class="error-card">
        <template #header>
          <h3>⚠️ 오류가 발생했습니다</h3>
        </template>
        <p>{{ state.error }}</p>
        <template #footer>
          <div class="error-actions">
            <TcButton variant="primary" @click="retryCurrentStep">
              다시 시도
            </TcButton>
            <TcButton variant="ghost" @click="restartProcess()">
              처음부터 다시
            </TcButton>
          </div>
        </template>
      </TcCard>
    </div>

    <!-- Step 1: Worry Input -->
    <WorryInput
      v-else-if="state.currentStep === 'input'"
      :initial-worry="state.worryInput"
      @submit="handleWorrySubmit"
    />

    <!-- Step 2: Intro Framing before questions -->
    <IntroFraming
      v-else-if="
        state.currentStep === 'intro' && state.framingIntro && state.worryInput
      "
      :framing="state.framingIntro"
      @start="startQuestions"
      @back="goToStep('input')"
    />

    <!-- Step 3: Question Flow -->
    <QuestionFlow
      v-else-if="
        state.currentStep === 'questions' && state.questions.length > 0
      "
      :questions="state.questions"
      :initial-responses="state.responses"
      @complete="handleQuestionsComplete"
      @back="goToStep('input')"
    />

    <!-- Step 4: Analysis Result -->
    <AnalysisResult
      v-else-if="state.currentStep === 'result' && state.analysisResult"
      :result="state.analysisResult"
      :original-worry="state.worryInput?.content || ''"
      :questions="state.questions"
      :choice-a-label="state.framingIntro?.choiceALabel"
      :choice-b-label="state.framingIntro?.choiceBLabel"
      @restart="() => restartProcess('intro')"
      @back="goToStep('questions')"
    />

    <!-- Loading State -->
    <div v-else-if="state.isLoading" class="loading-container">
      <TcCard size="lg" class="loading-card">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h3 class="tc-heading-3">잠시만 기다려주세요...</h3>
          <p class="tc-body-text">{{ state.loadingMessage }}</p>
        </div>
      </TcCard>
    </div>

    <!-- Generating Questions Modal: same look-and-feel as QuestionFlow -->
    <TcDialog
      :modelValue="
        state.isLoading &&
        (state.currentStep === 'input' || state.currentStep === 'intro')
      "
      :title="
        state.currentStep === 'input'
          ? '🧭 AI가 고민을 구조화하고 있어요'
          : '🤔 AI가 질문을 생성 중입니다'
      "
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
          {{ genStages[genStageIndex] || '맞춤형 질문을 준비하고 있어요...' }}
        </p>
        <div class="analysis-progress">
          <div
            class="analysis-progress-fill"
            :style="{ width: genProgress + '%' }"
          ></div>
        </div>
      </div>
    </TcDialog>
  </div>
</template>

<script setup lang="ts">
import {
  AnalysisResult,
  QuestionFlow,
  WorryInput,
} from '@/components/thinking';
import { TcButton, TcCard, TcDialog } from '@/components/ui';
import { useThinkingFlow } from '@/composables/useThinkingFlow';
import type { WorryInput as WorryInputType } from '@/types';
import { onMounted, ref, watch } from 'vue';
import IntroFraming from './IntroFraming.vue';
import './QuestionFlow.scss';
import './ThinkingProcess.scss';

const props = defineProps<{
  initialWorry?: WorryInputType | null;
  autoStart?: boolean;
}>();

const {
  state,
  currentSession,
  goToStep,
  handleWorrySubmit,
  handleQuestionsComplete,
  startQuestions,
  retryCurrentStep,
  restartProcess,
} = useThinkingFlow();

// Generating-questions modal progress (match QuestionFlow speed/style)
const genStageIndex = ref<number>(0);
const genProgress = ref<number>(0);
const genStages = [
  '고민의 핵심을 파악하고 있습니다...',
  '맥락과 우선순위를 정리하고 있습니다...',
  '맞춤형 질문 후보를 생성하고 있습니다...',
  '질문의 흐름과 난이도를 구성하고 있습니다...',
  '완성 중입니다... 곧 시작할게요!',
];
const startGeneratingProgress = async () => {
  genStageIndex.value = 0;
  genProgress.value = 0;
  // staged, gradual animation (same pacing as QuestionFlow)
  const totalStages = genStages.length;
  for (let i = 0; i < totalStages; i++) {
    if (
      !(
        state.isLoading &&
        (state.currentStep === 'input' || state.currentStep === 'intro')
      )
    )
      break;
    genStageIndex.value = i;
    const start = (i / totalStages) * 100;
    const end = ((i + 1) / totalStages) * 100;
    const duration = 1500; // 1.5s per stage (QuestionFlow)
    const steps = 20;
    const stepDuration = duration / steps;
    const stepDelta = (end - start) / steps;
    for (let j = 0; j < steps; j++) {
      if (
        !(
          state.isLoading &&
          (state.currentStep === 'input' || state.currentStep === 'intro')
        )
      )
        break;
      await new Promise(r => setTimeout(r, stepDuration));
      genProgress.value = Math.min(99, start + stepDelta * (j + 1));
    }
  }
};

const stopGeneratingProgress = () => {
  genProgress.value = 100;
  // small timeout is fine; dialog closes immediately after step change
  setTimeout(() => {
    genProgress.value = 0;
    genStageIndex.value = 0;
  }, 300);
};

watch(
  () =>
    state.isLoading &&
    (state.currentStep === 'input' || state.currentStep === 'intro'),
  active => {
    if (active) startGeneratingProgress();
    else stopGeneratingProgress();
  }
);

const tryAutoStart = () => {
  if (
    props.autoStart &&
    props.initialWorry &&
    state.currentStep === 'input' &&
    !state.isLoading
  ) {
    handleWorrySubmit(props.initialWorry);
  }
};

onMounted(tryAutoStart);
watch(() => [props.autoStart, props.initialWorry], tryAutoStart);

defineExpose({
  restartProcess,
  goToStep,
  currentSession,
});
</script>
