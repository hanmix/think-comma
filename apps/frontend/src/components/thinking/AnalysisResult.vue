<template>
  <div class="analysis-result">
    <!-- Result Header -->
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

    <!-- Final Recommendation -->
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

      <TcCard v-if="hasRationale" class="analysis-card rationale-card">
        <template #header>
          <div
            class="accordion-header"
            role="button"
            tabindex="0"
            :aria-expanded="showRationale"
            @click="toggleRationale"
            @keydown.enter.prevent="toggleRationale"
            @keydown.space.prevent="toggleRationale"
          >
            <h3>🧩 왜 이런 결과인가요?</h3>
            <button
              class="accordion-toggle"
              type="button"
              :aria-label="showRationale ? '접기' : '펴기'"
              :aria-expanded="showRationale"
              @click.stop="toggleRationale"
            >
              <svg
                class="accordion-icon"
                :class="{ open: showRationale }"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </template>
        <div class="accordion-content" :class="{ open: showRationale }">
          <p class="tc-readable" v-if="result.rationale?.overview">
            {{ result.rationale.overview }}
          </p>
          <div class="reasons-list" v-if="result.rationale?.keyReasons?.length">
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
        </div>
      </TcCard>
    </div>

    <!-- Choice History Toggle -->
    <div class="history-toggle">
      <TcButton variant="outline" size="lg" @click="toggleChoiceHistory">
        📋 {{ showHistory ? '선택 과정 숨기기' : '내 선택 과정 보기' }}
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
            <p class="history-question">
              {{ getQuestionText(response.questionId) }}
            </p>
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
    </TcCard>

    <!-- Action Guide -->
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

    <!-- Next Suggestion -->
    <TcCard v-if="nextSuggestion" variant="info" class="next-suggestion">
      <div class="next-suggestion-content">
        <h4>🧠 다음 기회를 위한 제안</h4>
        <p>{{ nextSuggestion }}</p>
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
import { TcButton, TcCard } from '@/components/ui';
import { useResultDerivations } from '@/composables/useResultDerivations';
import type { AnalysisResult, Question } from '@/types/thinking';
import { computed, ref } from 'vue';
import './AnalysisResult.scss';

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

const showHistory = ref<boolean>(false);
const { aChoiceCount, bChoiceCount, getLevelText, getChoicePattern } =
  useResultDerivations(props.result);

const toggleChoiceHistory = () => {
  showHistory.value = !showHistory.value;
};

const confidencePercent = Math.round((props.result.confidence || 0) * 100);

function getQuestionText(id: number) {
  const q = props.questions?.find(q => q.id === id);
  if (q) return `${q.text}`;
}

// Derive action guide steps and suggestion with backward compatibility
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
// Labels: prefer framing labels passed via props, fallback to result labels
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

// Accordion state for rationale section
const showRationale = ref<boolean>(false);
const hasRationale = computed(
  () =>
    !!(
      props.result.rationale?.overview ||
      props.result.rationale?.keyReasons?.length
    )
);
const toggleRationale = () => {
  showRationale.value = !showRationale.value;
};
</script>
