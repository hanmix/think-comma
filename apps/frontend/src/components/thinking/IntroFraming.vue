<template>
  <div class="intro-framing">
    <TcCard size="lg" class="intro-card">
      <template #header>
        <h3>🧭 고민 구조화</h3>
      </template>
      <p class="summary tc-readable">{{ framing.summary }}</p>

      <div class="ab-box">
        <div class="ab-item">
          <div class="ab-badge a">A</div>
          <div class="ab-content">
            <p class="ab-title">
              <strong>{{ framing.choiceALabel }}</strong>
            </p>
            <p class="ab-hint">{{ framing.aHint }}</p>
          </div>
        </div>
        <div class="ab-item">
          <div class="ab-badge b">B</div>
          <div class="ab-content">
            <p class="ab-title">
              <strong>{{ framing.choiceBLabel }}</strong>
            </p>
            <p class="ab-hint">{{ framing.bHint }}</p>
          </div>
        </div>
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
import { TcButton, TcCard } from '@/components/ui';
import type { FramingIntro } from '@/types';
import './IntroFraming.scss';

defineProps<{ framing: FramingIntro }>();
defineEmits<{ (e: 'start'): void; (e: 'back'): void }>();
</script>
