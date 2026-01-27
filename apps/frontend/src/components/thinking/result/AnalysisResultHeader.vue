<template>
  <div class="result-header">
    <h1 class="tc-heading-1">🎯 분석 완료</h1>
    <p class="result-subtitle">
      {{ recommendedLabel }} vs {{ otherLabel }} - 종합 분석 결과
    </p>

    <TcCard variant="info" class="worry-summary">
      <template #header>
        <h3>📝 당신의 고민</h3>
      </template>
      <p class="worry-text">{{ originalWorry }}</p>
    </TcCard>
  </div>
</template>

<script setup lang="ts">
import { TcCard } from '@/components/ui';

defineProps<{
  originalWorry: string;
  recommendedLabel: string;
  otherLabel: string;
}>();
</script>
