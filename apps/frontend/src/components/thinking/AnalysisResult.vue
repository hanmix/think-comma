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
import { TcButton } from '@/components/common/ui';
import { useAnalysisResult } from '@/composables';
import type { AnalysisResult, Question } from '@/types';
import { ref } from 'vue';
import './AnalysisResult.scss';
import AnalysisResultActionGuide from './result/AnalysisResultActionGuide.vue';
import AnalysisResultHeader from './result/AnalysisResultHeader.vue';
import AnalysisResultHistory from './result/AnalysisResultHistory.vue';
import AnalysisResultInsights from './result/AnalysisResultInsights.vue';
import AnalysisResultRecommendation from './result/AnalysisResultRecommendation.vue';

const props = defineProps<{
  result: AnalysisResult;
  originalWorry: string;
  questions?: Question[];
  choiceALabel?: string;
  choiceBLabel?: string;
}>();

const showHistory = ref(false);
const {
  confidencePercent,
  guideSteps,
  nextSuggestion,
  recommendedLabel,
  otherLabel,
  scoreALabel,
  scoreBLabel,
} = useAnalysisResult(props.result, {
  choiceALabel: props.choiceALabel,
  choiceBLabel: props.choiceBLabel,
});
</script>
