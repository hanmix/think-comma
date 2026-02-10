<template>
  <div class="analysis-result">
    <AnalysisResultHeader
      :original-worry="originalWorry"
      :recommended-label="recommendedLabel"
      :other-label="otherLabel"
      :show-history="showHistory"
      @toggle-history="showHistory = !showHistory"
    />

    <AnalysisResultRecommendation
      :result="result"
      :recommended-label="recommendedLabel"
      :score-a-label="scoreALabel"
      :score-b-label="scoreBLabel"
      :confidence-percent="confidencePercent"
    />

    <AnalysisResultInsights :result="result" />

    <AnalysisResultHistory
      v-model="showHistory"
      :result="result"
      :questions="questions"
    />

    <AnalysisResultActionGuide
      :guide-steps="guideSteps"
      :next-suggestion="nextSuggestion"
    />

    <!-- 액션 버튼 -->
    <div class="result-actions">
      <TcButton variant="outline" @click="$emit('restart')">
        🔄 새로운 고민 상담하기
      </TcButton>
      <TcButton variant="ghost" @click="$emit('back')">
        ← 질문으로 돌아가기
      </TcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TcButton } from '@/components/ui';
import type { AnalysisResult, Question } from '@/types';
import { computed, ref } from 'vue';
import './AnalysisResult.scss';
import AnalysisResultActionGuide from './result/AnalysisResultActionGuide.vue';
import AnalysisResultHeader from './result/AnalysisResultHeader.vue';
import AnalysisResultHistory from './result/AnalysisResultHistory.vue';
import AnalysisResultInsights from './result/AnalysisResultInsights.vue';
import AnalysisResultRecommendation from './result/AnalysisResultRecommendation.vue';

interface Props {
  result: AnalysisResult;
  originalWorry: string;
  questions?: Question[];
  choiceALabel?: string;
  choiceBLabel?: string;
}

interface Emits {
  (event: 'restart'): void;
  (event: 'back'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showHistory = ref(false);

const confidencePercent = Math.round((props.result.confidence || 0) * 100);

// 하위 호환을 고려하여 액션 가이드 단계/추천을 도출
type GuideStep = { title: string; description: string };
const guideSteps: GuideStep[] = (
  props.result.actionGuide?.steps?.length
    ? props.result.actionGuide.steps
    : (props.result.actionSteps || []).map(s => ({
        title: s,
        description: '',
      }))
) as GuideStep[];

const nextSuggestion: string | undefined =
  props.result.actionGuide?.nextSuggestion;
// 라벨: props로 전달된 프레이밍 라벨 우선, 없으면 결과 라벨 사용
const aLabel = computed(
  () =>
    props.choiceALabel ??
    (props.result.recommendedChoice === 'A'
      ? props.result.recommendedChoiceLabel
      : props.result.otherChoiceLabel)
);
const bLabel = computed(
  () =>
    props.choiceBLabel ??
    (props.result.recommendedChoice === 'B'
      ? props.result.recommendedChoiceLabel
      : props.result.otherChoiceLabel)
);
const recommendedLabel = computed(() =>
  props.result.recommendedChoice === 'A' ? aLabel.value : bLabel.value
);
const otherLabel = computed(() =>
  props.result.recommendedChoice === 'A' ? bLabel.value : aLabel.value
);

const scoreALabel = computed(() =>
  props.result.scoreA >= props.result.scoreB
    ? recommendedLabel.value
    : otherLabel.value
);
const scoreBLabel = computed(() =>
  props.result.scoreB > props.result.scoreA
    ? recommendedLabel.value
    : otherLabel.value
);

</script>
