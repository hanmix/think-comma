<template>
  <div>
    <TcCard variant="success" size="lg" class="final-result">
      <div class="recommendation-content">
        <h2 class="recommendation-title">
          {{ `"${recommendedLabel}"` }}
          를 추천합니다
        </h2>
        <p class="recommendation-detail">
          {{ result.summary }}
        </p>
        <div
          class="confidence-meter"
          role="progressbar"
          aria-label="확신도"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="confidencePercent"
        >
          <div
            class="confidence-fill"
            :style="{ width: confidencePercent + '%' }"
          ></div>
        </div>
        <p class="confidence-text">확신도: {{ confidencePercent }}%</p>
      </div>
    </TcCard>

    <div class="score-comparison">
      <div
        class="choice-column"
        :class="{
          winner: result.recommendedChoice === 'A',
          loser: result.recommendedChoice === 'B',
        }"
      >
        <div class="choice-score">{{ result.scoreA }}</div>
        <div class="choice-label">
          {{ scoreALabel }}
        </div>
      </div>
      <div class="vs-divider">VS</div>
      <div
        class="choice-column"
        :class="{
          winner: result.recommendedChoice === 'B',
          loser: result.recommendedChoice === 'A',
        }"
      >
        <div class="choice-score">{{ result.scoreB }}</div>
        <div class="choice-label">
          {{ scoreBLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TcCard } from '@/components/ui';
import type { AnalysisResult } from '@/types';

defineProps<{
  result: AnalysisResult;
  recommendedLabel: string;
  scoreALabel: string;
  scoreBLabel: string;
  confidencePercent: number;
}>();
</script>
