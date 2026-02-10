<template>
  <div class="thinking-process">
    <!-- 에러 상태 -->
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

    <!-- 1단계: 고민 입력 -->
    <WorryInput
      v-else-if="state.currentStep === 'input'"
      :initial-worry="state.worryInput"
      @submit="handleWorrySubmit"
    />

    <!-- 2단계: 질문 전 프레이밍 안내 -->
    <IntroFraming
      v-else-if="
        state.currentStep === 'intro' && state.framingIntro && state.worryInput
      "
      :framing="state.framingIntro"
      @start="startQuestions"
      @back="goToStep('input')"
    />

    <!-- 3단계: 질문 진행 -->
    <QuestionFlow
      v-else-if="
        state.currentStep === 'questions' && state.questions.length > 0
      "
      :questions="state.questions"
      :initial-responses="state.responses"
      @complete="handleQuestionsComplete"
      @back="goToStep('input')"
    />

    <!-- 4단계: 분석 결과 -->
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

    <!-- 로딩 상태 -->
    <div v-else-if="state.isLoading" class="loading-container">
      <TcCard size="lg" class="loading-card">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h3 class="tc-heading-3">잠시만 기다려주세요...</h3>
          <p class="tc-body-text">{{ state.loadingMessage }}</p>
        </div>
      </TcCard>
    </div>

    <!-- 질문 생성 모달: QuestionFlow와 동일한 룩앤필 -->
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
import AnalysisResult from '@/components/thinking/AnalysisResult.vue';
import QuestionFlow from '@/components/thinking/QuestionFlow.vue';
import WorryInput from '@/components/thinking/WorryInput.vue';
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

// 질문 생성 모달 진행 표시 (QuestionFlow와 동일한 속도/스타일)
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
  // 단계적으로 천천히 진행 (QuestionFlow와 동일한 페이싱)
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
    const duration = 1500; // 단계당 1.5초 (QuestionFlow)
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
  // 짧은 타임아웃이면 충분함; 단계 변경 직후 모달이 즉시 닫힘
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

onMounted(() => {
  tryAutoStart();
});
watch(() => [props.autoStart, props.initialWorry], tryAutoStart);

defineExpose({
  restartProcess,
  goToStep,
  currentSession,
});
</script>
