<template>
  <div class="thinking-process">
    <!-- Step 1: Worry Input -->
    <WorryInput v-if="state.currentStep === 'input'" @submit="handleWorrySubmit" />

    <!-- Step 2: Question Flow -->
    <QuestionFlow
      v-else-if="state.currentStep === 'questions' && state.questions.length > 0"
      :questions="state.questions"
      :initial-responses="state.responses"
      @complete="handleQuestionsComplete"
      @back="goToStep('input')"
    />

    <!-- Step 3: Analysis Result -->
    <AnalysisResult
      v-else-if="state.currentStep === 'result' && state.analysisResult"
      :result="state.analysisResult"
      :original-worry="state.worryInput?.content || ''"
      @restart="restartProcess"
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

    <!-- Error State -->
    <div v-else-if="state.error" class="error-container">
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
            <TcButton variant="ghost" @click="restartProcess">
              처음부터 다시
            </TcButton>
          </div>
        </template>
      </TcCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from "vue";
import { WorryInput, QuestionFlow, AnalysisResult } from "@/components/thinking";
import { TcButton, TcCard } from "@/components/ui";
import type { WorryInput as WorryInputType, UserResponse } from "@/types/thinking";
import { useThinkingFlow } from "@/composables/useThinkingFlow";
import './ThinkingProcess.scss';

const props = defineProps<{ initialWorry?: WorryInputType | null; autoStart?: boolean }>();

const {
  state,
  currentSession,
  goToStep,
  handleWorrySubmit,
  handleQuestionsComplete,
  retryCurrentStep,
  restartProcess,
  saveSession,
  loadSession,
} = useThinkingFlow();

const tryAutoStart = () => {
  if (props.autoStart && props.initialWorry && state.currentStep === 'input' && !state.isLoading) {
    handleWorrySubmit(props.initialWorry);
  }
};

onMounted(tryAutoStart);
watch(() => [props.autoStart, props.initialWorry], tryAutoStart);

defineExpose({ restartProcess, goToStep, currentSession, saveSession, loadSession });
</script>
