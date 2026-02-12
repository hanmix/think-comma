<template>
  <div class="analysis-grid">
    <TcCard class="analysis-card">
      <template #header>
        <h3>🧠 당신의 성향 분석</h3>
      </template>

      <div class="traits-list">
        <div
          v-for="trait in result.personalityTraits"
          :key="trait.name"
          class="trait-item"
        >
          <div class="trait-label">
            {{ trait.name }}
            <span class="percent-badge">{{ Math.round(trait.score) }}%</span>
          </div>
          <div class="trait-bar">
            <div
              class="trait-fill"
              :class="trait.level"
              :style="{ width: trait.score + '%' }"
            ></div>
          </div>
          <div class="trait-level">{{ getLevelText(trait.level) }}</div>
        </div>
      </div>
    </TcCard>

    <TcCard class="analysis-card">
      <template #header>
        <h3>🎯 핵심 결정 요인</h3>
      </template>

      <div class="factors-list">
        <div
          v-for="factor in result.decisionFactors"
          :key="factor.name"
          class="factor-item"
        >
          <div class="factor-label">
            {{ factor.name }}
            <span class="percent-badge">{{ Math.round(factor.score) }}%</span>
          </div>
          <div class="factor-bar">
            <div
              class="factor-fill"
              :class="factor.level"
              :style="{ width: factor.score + '%' }"
            ></div>
          </div>
          <div class="factor-level">{{ getLevelText(factor.level) }}</div>
        </div>
      </div>
    </TcCard>

    <TcCard class="analysis-card rationale-card">
      <template #header>
        <h3>🧩 왜 이런 결과가 나왔나요?</h3>
      </template>
      <div class="reasons-list" v-if="result.rationale?.keyReasons?.length">
        <p v-if="result.rationale?.overview">
          {{ result.rationale.overview }}
        </p>
        <div
          v-for="(r, idx) in result.rationale.keyReasons"
          :key="idx"
          class="reason-item"
        >
          <div class="reason-header">
            <span class="reason-name">{{ r.name }}</span>
            <span class="percent-badge" v-if="r.weight != null"
              >{{ Math.round(r.weight) }}%</span
            >
          </div>
          <p class="reason-detail">{{ r.detail }}</p>
          <div class="reason-related" v-if="r.relatedQuestions?.length">
            관련 문항: Q{{ r.relatedQuestions.join(', Q') }}
          </div>
        </div>
      </div>
    </TcCard>
  </div>
</template>

<script setup lang="ts">
import { TcCard } from '@/components/ui';
import { useAnalysisResult } from '@/composables';
import type { AnalysisResult } from '@/types';

const props = defineProps<{ result: AnalysisResult }>();
const { getLevelText } = useAnalysisResult(props.result);
</script>
