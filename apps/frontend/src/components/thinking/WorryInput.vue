<template>
  <div class="worry-input">
    <div class="worry-header">
      <h1 class="tc-heading-1">
        Think<span class="tc-comma-highlight">,</span> 고민을 풀어보세요.
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
          :minlength="minLength"
          :maxlength="maxLength"
          :placeholder="placeholder"
          :help-text="`최소 ${minLength}자 · 최대 ${maxLength}자`"
          :error-text="errorText || undefined"
          :aria-describedby="describedBy"
          :aria-invalid="!!errorText"
        />
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
              :disabled="!isValid || props.isLoading"
              @click="handleSubmit"
            >
              <span v-if="props.isLoading">🤔 AI가 질문 생성 중...</span>
              <span v-else>🚀 3분 고민 해결 시작하기</span>
            </TcButton>
          </div>
        </div>
      </template>
    </TcCard>
  </div>
</template>

<script setup lang="ts">
import { TcButton, TcCard, TcTextarea } from '@/components/ui';
import TcSelect from '@/components/ui/TcSelect.vue';
import { useWorryInput } from '@/composables/useWorryInput';
import { categoryOptions } from '@/constants';
import type { WorryInput } from '@/types';
import { getRandomPlaceholder } from '@/utils/';
import { computed, ref, useId, watch } from 'vue';
import './WorryInput.scss';

interface Props {
  initialWorry?: WorryInput | null;
  isLoading?: boolean;
}

interface Emits {
  (event: 'submit', worry: WorryInput): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const { minLength, maxLength, worry, errorText, isValid, validateWorry } =
  useWorryInput();
const placeholder = ref(getRandomPlaceholder(worry.category));

// 접근성 ID
const uid = useId();
// 카테고리 옵션 (공통 Select의 options prop 사용)

// categoryId는 공통 Select 컴포넌트가 자체적으로 처리
const countId = `worry-count-${uid}`;

const describedBy = computed(() => {
  // 카운트 텍스트만 aria-describedby로 연결
  return countId;
});

watch(
  () => props.initialWorry,
  value => {
    if (!value) return;
    worry.content = value.content;
    worry.category = value.category || '';
  },
  { immediate: true }
);

watch(
  () => worry.category,
  value => {
    placeholder.value = getRandomPlaceholder(value);
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!validateWorry()) return;

  // 즉시 상위로 제출 이벤트를 전달하고, 상위 컴포넌트에서 API 호출/모달 제어를 수행합니다.
  // 이 버튼은 중복 클릭 방지를 위해 잠시 비활성화됩니다.
  emit('submit', { ...worry });
};
</script>
