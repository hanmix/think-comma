import { WORRY_MAX_LENGTH, WORRY_MIN_LENGTH } from '@/constants';
import type { WorryInput } from '@/types';
import { getRandomPlaceholder } from '@/utils';
import { computed, reactive, ref, watch } from 'vue';

const getTrimmedLength = (value: string) => value.trim().length;

const getWorryValidationError = (
  value: string,
  minLength: number,
  maxLength: number
) => {
  const trimmedLength = getTrimmedLength(value);
  if (!trimmedLength) return '';
  if (trimmedLength < minLength) {
    return `고민을 좀 더 자세히 설명해주세요. (최소 ${minLength}자 이상)`;
  }
  if (value.length > maxLength) {
    return `고민 내용이 너무 깁니다. (최대 ${maxLength}자 까지)`;
  }
  return '';
};

const isWorryValid = (value: string, minLength: number, maxLength: number) => {
  const trimmedLength = getTrimmedLength(value);
  return trimmedLength >= minLength && value.length <= maxLength;
};

export function useWorryInput() {
  const minLength = WORRY_MIN_LENGTH;
  const maxLength = WORRY_MAX_LENGTH;

  const worry = reactive<WorryInput>({ content: '', category: '' });
  const errorText = ref<string>('');
  const placeholder = ref(getRandomPlaceholder(worry.category));

  const isValid = computed(() =>
    isWorryValid(worry.content, minLength, maxLength)
  );

  const validateWorry = () => isValid.value;

  const syncInitialWorry = (initial?: WorryInput | null) => {
    if (!initial) return;
    worry.content = initial.content;
    worry.category = initial.category || '';
  };

  const bindInitialWorry = (getter: () => WorryInput | null | undefined) => {
    watch(
      () => getter(),
      value => {
        syncInitialWorry(value);
      },
      { immediate: true }
    );
  };

  const resetWorry = () => {
    worry.content = '';
    worry.category = '';
    errorText.value = '';
  };

  watch(
    () => worry.content,
    value => {
      errorText.value = getWorryValidationError(value, minLength, maxLength);
    }
  );

  watch(
    () => worry.category,
    value => {
      placeholder.value = getRandomPlaceholder(value);
    },
    { immediate: true }
  );

  return {
    minLength,
    maxLength,
    worry,
    placeholder,
    errorText,
    isValid,
    validateWorry,
    resetWorry,
    syncInitialWorry,
    bindInitialWorry,
  };
}
