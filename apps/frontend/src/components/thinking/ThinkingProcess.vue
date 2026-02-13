<template>
  <div class="thinking-process">
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

    <WorryInput
      v-else-if="state.currentStep === 'input'"
      :initial-worry="state.worryInput"
      :is-loading="state.isLoading"
      @submit="handleWorrySubmit"
    />

    <IntroFraming
      v-else-if="
        state.currentStep === 'intro' && state.framingIntro && state.worryInput
      "
      :framing="state.framingIntro"
      @start="startQuestions"
      @back="goToStep('input')"
    />

    <QuestionFlow
      v-else-if="
        state.currentStep === 'questions' && state.questions.length > 0
      "
      :questions="state.questions"
      :initial-responses="state.responses"
      @complete="handleQuestionsComplete"
      @cancel="cancelCurrentStep"
      @back="goToStep('input')"
    />

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

    <div v-else-if="state.isLoading" class="loading-container">
      <TcCard size="lg" class="loading-card">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h3 class="tc-heading-3">잠시만 기다려주세요...</h3>
          <p class="tc-body-text">{{ state.loadingMessage }}</p>
        </div>
      </TcCard>
    </div>

    <TcDialog
      :modelValue="isGeneratingDialogActive"
      :title="
        state.currentStep === 'input'
          ? '🧭 AI가 고민을 구조화하고 있어요'
          : '🤔 AI가 질문을 생성 중입니다'
      "
      :closable="true"
      :closeOnBackdrop="false"
      @update:modelValue="onLoadingDialogChange"
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
import { TcButton, TcCard, TcDialog } from '@/components/common/ui';
import { useThinkingFlow } from '@/composables';
import type { WorryInput as WorryInputType } from '@/types';
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
  genStages,
  genStageIndex,
  genProgress,
  isGeneratingDialogActive,
  goToStep,
  handleWorrySubmit,
  handleQuestionsComplete,
  startQuestions,
  retryCurrentStep,
  restartProcess,
  onLoadingDialogChange,
  bindAutoStart,
  cancelCurrentStep,
} = useThinkingFlow();

bindAutoStart({
  autoStart: () => props.autoStart,
  initialWorry: () => props.initialWorry,
});

defineExpose({
  restartProcess,
  goToStep,
  currentSession,
});
</script>
