<template>
  <div class="result-header">
    <div class="result-header-top">
      <div class="result-header-spacer" />
      <h1 class="tc-heading-1">🎯 분석 완료</h1>
      <div class="result-header-actions">
        <TcButton variant="outline" size="sm" @click="$emit('toggle-history')">
          📋 선택한 질문 목록
        </TcButton>
      </div>
    </div>
    <p class="result-subtitle">
      {{ recommendedLabel }} vs {{ otherLabel }} - 종합 분석 결과
    </p>

    <TcCard class="worry-guidance">
      <template #header>
        <h3>📝 당신의 고민</h3>
      </template>
      <p class="worry-text">{{ originalWorry }}</p>
    </TcCard>
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard } from '@/components/ui';

defineProps<{
  originalWorry: string;
  recommendedLabel: string;
  otherLabel: string;
  showHistory: boolean;
}>();

defineEmits<{ 'toggle-history': [] }>();
</script>
