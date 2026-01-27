<template>
  <div>
    <TcCard variant="info" size="lg" class="action-guide">
      <template #header>
        <h3>💡 구체적 행동 가이드</h3>
        <p class="guide-subtitle">추천하는 3단계 행동 계획</p>
      </template>

      <div class="action-steps">
        <div
          v-for="(step, index) in guideSteps"
          :key="index"
          class="action-step"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <p class="step-title">{{ step.title }}</p>
            <p class="step-desc" v-if="step.description">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </TcCard>

    <TcCard v-if="nextSuggestion" variant="info" class="next-suggestion">
      <div class="next-suggestion-content">
        <h4>🧠 다음 기회를 위한 제안</h4>
        <p>{{ nextSuggestion }}</p>
      </div>
    </TcCard>

    <TcCard variant="success" class="final-message">
      <div class="final-message-content">
        <h3>🌱 기억하세요</h3>
        <p>
          모든 선택에는 그 나름의 가치가 있습니다. 중요한 것은 선택 후에 최선을
          다하는 것입니다.
        </p>
      </div>
    </TcCard>
  </div>
</template>

<script setup lang="ts">
import { TcCard } from '@/components/ui';

defineProps<{
  guideSteps: Array<{ title: string; description: string }>;
  nextSuggestion?: string;
}>();
</script>
