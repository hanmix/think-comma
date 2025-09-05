<template>
  <div class="worry-input">
    <div class="worry-header">
      <h1 class="tc-heading-1">
        Think<span class="tc-comma-highlight">,</span> 고민을 풀어보세요
      </h1>
      <p class="tc-body-text tc-readable">
        지금 가장 고민되는 것을 자유롭게 적어주세요.
        <br />
        3분 후면 명확한 답을 찾을 수 있을 거예요.
      </p>
    </div>

    <TcCard size="lg" class="input-card">
      <template #header>
        <h3 class="tc-heading-3">📝 현재 고민</h3>
        <p class="tc-small-text tc-text-muted">
          어떤 상황인지, 왜 고민인지, 어떤 선택지들이 있는지 편하게 써주세요
        </p>
      </template>

      <div class="input-section">
        <TcSelect
          v-model="worry.category"
          label="고민 카테고리 (선택사항)"
          :options="categoryOptions"
          placeholder="카테고리 선택"
        />

        <TcTextarea
          v-model="worry.content"
          label="고민 내용"
          :required="true"
          :rows="6"
          textarea-class="worry-textarea"
          :maxlength="1000"
          :placeholder="`예: '직장을 그만두고 창업을 할지, 계속 다닐지 고민입니다. 안정적인 수입은 있지만 꿈을 이루고 싶기도 하고... 나이도 있어서 마지막 기회일 것 같은데 실패하면 어떻게 할지 모르겠어요.'`"
          :help-text="'최소 10자 · 최대 1000자'"
          :error="error || undefined"
          :aria-describedby="describedBy"
          :aria-invalid="!!error"
        />
        <div class="character-count">
          <span
            :class="{
              'text-warning': worry.content.length > 800,
              'text-error': worry.content.length >= 1000,
            }"
            :id="countId"
            aria-live="polite"
            aria-atomic="true"
          >
            {{ worry.content.length }}
          </span>
          <span class="tc-text-muted">/ 1000자</span>
        </div>
      </div>

      <template #footer>
        <div class="action-footer">
          <div class="tips">
            <h4 class="tip-title">💡 더 정확한 분석을 위한 팁</h4>
            <ul class="tip-list">
              <li>구체적인 상황을 설명해주세요</li>
              <li>왜 고민인지 이유를 적어주세요</li>
              <li>어떤 선택지들이 있는지 언급해주세요</li>
              <li>본인의 감정이나 걱정을 솔직하게 표현해주세요</li>
            </ul>
          </div>
          <div class="action-buttons">
            <TcButton
              variant="primary"
              size="md"
              :disabled="!isValid || isLoading"
              @click="handleSubmit"
            >
              <span v-if="isLoading">🤔 AI가 질문 생성 중...</span>
              <span v-else>🚀 3분 고민 해결 시작하기</span>
            </TcButton>
          </div>
        </div>
      </template>
    </TcCard>
    <!-- 
    <div class="process-preview">
      <h3 class="tc-heading-3">📋 진행 과정</h3>
      <div class="process-steps">
        <div class="process-step active">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>고민 입력</h4>
            <p>현재 상황과 고민 설명</p>
          </div>
        </div>
        <div class="process-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>10개 질문 답변</h4>
            <p>AI가 생성한 맞춤형 질문들</p>
          </div>
        </div>
        <div class="process-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>분석 결과</h4>
            <p>개인화된 해결책과 행동 가이드</p>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard, TcTextarea } from "@/components/ui";
import TcSelect from "@/components/ui/TcSelect.vue";
import { useWorryInput } from "@/composables/useWorryInput";
import type { WorryInput } from "@/types/thinking";
import { computed, ref } from "vue";
import "./WorryInput.scss";

interface Emits {
  (event: "submit", worry: WorryInput): void;
}

const emit = defineEmits<Emits>();

const { worry, error, isValid, validateWorry } = useWorryInput({
  minLength: 10,
  maxLength: 1000,
});
const isLoading = ref<boolean>(false);

// Accessibility IDs
const uid = Math.random().toString(36).slice(2, 8);
// 카테고리 옵션 (공통 Select의 options prop 사용)
const categoryOptions = [
  { value: "career", label: "진로/취업" },
  { value: "relationship", label: "연애/인간관계" },
  { value: "business", label: "창업/사업" },
  { value: "life", label: "인생/라이프스타일" },
  { value: "study", label: "학업/자기계발" },
  { value: "family", label: "가족" },
  { value: "money", label: "돈/재정" },
  { value: "other", label: "기타" },
];
// categoryId는 공통 Select 컴포넌트가 자체적으로 처리
const countId = `worry-count-${uid}`;

const describedBy = computed(() => {
  // 카운트 텍스트만 aria-describedby로 연결
  return countId;
});

const handleSubmit = async () => {
  if (!validateWorry()) return;

  // 즉시 상위로 제출 이벤트를 전달하고, 상위 컴포넌트에서 API 호출/모달 제어를 수행합니다.
  // 이 버튼은 중복 클릭 방지를 위해 잠시 비활성화됩니다.
  isLoading.value = true;
  emit("submit", { ...worry });
};
</script>
