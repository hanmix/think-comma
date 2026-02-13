<template>
  <div class="intro-framing">
    <TcCard size="lg" class="intro-card">
      <template #header>
        <h3>🧭 고민 구조화</h3>
      </template>

      <div class="ab-duel-frame">
        <div class="ab-frame a">
          <div class="ab-frame-header">
            <span class="ab-badge">A</span>
            <strong class="ab-title">{{ framing.choiceALabel }}</strong>
          </div>
          <p class="ab-hint">{{ framing.aHint }}</p>
        </div>
        <div class="ab-vs">VS</div>
        <div class="ab-frame b">
          <div class="ab-frame-header">
            <span class="ab-badge">B</span>
            <strong class="ab-title">{{ framing.choiceBLabel }}</strong>
          </div>
          <p class="ab-hint">{{ framing.bHint }}</p>
        </div>
      </div>

      <div v-if="framing.axis.keywords?.length" class="axis-keywords">
        <p class="axis-keywords-label">주요 키워드</p>
        <span
          v-for="keyword in framing.axis.keywords"
          :key="keyword"
          class="axis-chip"
          >{{ keyword }}</span
        >
      </div>

      <p class="cta">{{ framing.cta }}</p>

      <div class="actions">
        <TcButton variant="primary" size="lg" @click="$emit('start')"
          >시작하기</TcButton
        >
        <TcButton variant="ghost" @click="$emit('back')">← 수정하기</TcButton>
      </div>
    </TcCard>
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard } from '@/components/common/ui';
import type { FramingIntro } from '@/types';
import './IntroFraming.scss';

defineProps<{ framing: FramingIntro }>();
defineEmits<{ (e: 'start'): void; (e: 'back'): void }>();
</script>
