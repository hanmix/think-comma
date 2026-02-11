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
import { onBeforeUnmount, ref, watch } from 'vue';
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
  selectChoice,
  goToNextQuestion: goToNextQuestionCore,
} = useQuestionProgress(props.questions, props.initialResponses || []);

const isAnalyzing = ref<boolean>(false);
const currentAnalysisStage = ref<number>(0);
const analysisProgress = ref<number>(0);
const suppressHover = ref<boolean>(false);
const freshMount = ref<boolean>(false);
// 질문 전환 중 빠른 연타를 막기 위한 가드
let isAdvancing = false;

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
    // 상위에서 분석 API 호출 동안 모달을 표시
    isAnalyzing.value = true;
    emit('complete', responses.value);
  }
};

// 선택 즉시 다음 질문으로 진행
const onSelect = async (choice: 'A' | 'B') => {
  if (isAdvancing) return;
  isAdvancing = true;
  // 선택 애니메이션을 잠깐 재생한 뒤 진행, 호버 잔상 제거
  suppressHover.value = true;
  selectChoice(choice);
  await new Promise(r => setTimeout(r, 180));
  freshMount.value = true; // 다음 질문 첫 렌더에서 트랜지션 비활성화
  await goToNextQuestion();
  // 다음 페인트 후 트랜지션/호버 재활성화
  setTimeout(() => {
    freshMount.value = false;
    suppressHover.value = false;
    isAdvancing = false;
  }, 50);
};

const onAnalyzeDialogChange = (open: boolean) => {
  if (open) return;
  isAnalyzing.value = false;
  emit('cancel');
};

// goToPreviousQuestion, goToQuestion은 컴포저블에서 제공됨

const runAnalysisProgress = async () => {
  // 단계별 애니메이션 실행, 자동 닫힘 없음
  currentAnalysisStage.value = 0;
  analysisProgress.value = 0;
  const stages = analysisStages.length;
  for (let i = 0; i < stages; i++) {
    if (!isAnalyzing.value) break;
    currentAnalysisStage.value = i;
    const start = (i / stages) * 100;
    const end = ((i + 1) / stages) * 100;
    const duration = 1500; // ThinkingProcess/QuestionFlow과 동일한 페이싱
    const steps = 20;
    const stepDuration = duration / steps;
    const delta = (end - start) / steps;
    for (let j = 0; j < steps; j++) {
      if (!isAnalyzing.value) break;
      await new Promise(r => setTimeout(r, stepDuration));
      analysisProgress.value = Math.min(99, start + delta * (j + 1));
    }
  }
  // 분석 중이면 100% 직전에서 유지
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
      // 진행률 마무리 후 다음 실행을 위해 초기화
      analysisProgress.value = 100;
      setTimeout(() => {
        analysisProgress.value = 0;
        currentAnalysisStage.value = 0;
      }, 200);
    }
  }
);

onBeforeUnmount(() => {
  // 언마운트 시 루프 중단
  isAnalyzing.value = false;
});
</script>
