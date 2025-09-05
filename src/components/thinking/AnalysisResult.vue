<template>
  <div class="analysis-result">
    <!-- Result Header -->
    <div class="result-header">
      <h1 class="tc-heading-1">🎯 분석 완료</h1>
      <p class="result-subtitle">
        {{ result.recommendedChoiceLabel }} vs {{ result.otherChoiceLabel }} -
        종합 분석 결과
      </p>

      <TcCard variant="info" class="worry-summary">
        <template #header>
          <h3>📝 당신의 고민</h3>
        </template>
        <p class="worry-text">{{ originalWorry }}</p>
      </TcCard>
    </div>

    <!-- Final Recommendation -->
    <TcCard variant="success" size="lg" class="final-result">
      <div class="recommendation-content">
        <h2 class="recommendation-title">
          {{ result.recommendedChoice }}를 추천합니다
        </h2>
        <p class="recommendation-detail">
          {{ result.recommendedChoiceLabel }}
        </p>
        <div class="confidence-meter">
          <div
            class="confidence-fill"
            :style="{ width: result.confidence + '%' }"
          ></div>
        </div>
        <p class="confidence-text">확신도: {{ result.confidence }}%</p>
      </div>
    </TcCard>

    <!-- Score Comparison -->
    <div class="score-comparison">
      <div
        class="choice-column"
        :class="{
          winner: result.recommendedChoice === 'A',
          loser: result.recommendedChoice === 'B',
        }"
      >
        <div class="choice-score">{{ result.scoreA }}</div>
        <div class="choice-label">{{ result.otherChoiceLabel }}</div>
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
        <div class="choice-label">{{ result.recommendedChoiceLabel }}</div>
      </div>
    </div>

    <!-- Analysis Grid -->
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
            <div class="trait-label">{{ trait.name }}</div>
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
            <div class="factor-label">{{ factor.name }}</div>
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
    </div>

    <!-- Choice History Toggle -->
    <div class="history-toggle">
      <TcButton variant="outline" size="lg" @click="toggleChoiceHistory">
        📋 {{ showHistory ? "선택 과정 숨기기" : "내 선택 과정 보기" }}
      </TcButton>
    </div>

    <!-- Choice History -->
    <TcCard v-if="showHistory" class="choice-history">
      <template #header>
        <h3>📝 당신이 선택한 답변들</h3>
      </template>

      <div class="history-list">
        <div
          v-for="(response, index) in result.responses"
          :key="response.questionId"
          class="history-item"
        >
          <div class="history-number">Q{{ response.questionId }}</div>
          <div class="history-content">
            <p class="history-question">질문 {{ response.questionId }}</p>
            <div class="history-choice">
              <span
                class="choice-badge"
                :class="`choice-${response.selectedChoice.toLowerCase()}`"
              >
                {{ response.selectedChoice }}
              </span>
              <span class="choice-text">{{ response.choiceContent }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="choice-summary">
        <h4>📊 선택 패턴 요약</h4>
        <p>
          A 선택: {{ aChoiceCount }}번 | B 선택: {{ bChoiceCount }}번<br />
          <strong>{{ getChoicePattern() }}</strong>
        </p>
      </div>
    </TcCard>

    <!-- Action Guide -->
    <TcCard variant="info" size="lg" class="action-guide">
      <template #header>
        <h3>💡 구체적 행동 가이드</h3>
        <p>{{ result.summary }}</p>
      </template>

      <div class="action-steps">
        <div
          v-for="(step, index) in result.actionSteps"
          :key="index"
          class="action-step"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <p>{{ step }}</p>
          </div>
        </div>
      </div>
    </TcCard>

    <!-- Final Message -->
    <TcCard variant="success" class="final-message">
      <div class="final-message-content">
        <h3>🌱 기억하세요</h3>
        <p>
          모든 선택에는 그 나름의 가치가 있습니다. 중요한 것은 선택 후에 최선을
          다하는 것입니다.
        </p>
      </div>
    </TcCard>

    <!-- Action Buttons -->
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
import { TcButton, TcCard } from "@/components/ui";
import { useResultDerivations } from "@/composables/useResultDerivations";
import type { AnalysisResult } from "@/types/thinking";
import { ref } from "vue";
import "./AnalysisResult.scss";

interface Props {
  result: AnalysisResult;
  originalWorry: string;
}

interface Emits {
  (event: "restart"): void;
  (event: "back"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showHistory = ref<boolean>(false);
const { aChoiceCount, bChoiceCount, getLevelText, getChoicePattern } =
  useResultDerivations(props.result);

const toggleChoiceHistory = () => {
  showHistory.value = !showHistory.value;
};
</script>
