import type { WorryInput } from '@/types';
import { computed, reactive, ref, watch } from 'vue';

export function useWorryInput() {
  const minLength = 10;
  const maxLength = 1000;

  const worry = reactive<WorryInput>({ content: '', category: '' });
  const errorText = ref<string>('');

  const isValid = computed(
    () =>
      worry.content.trim().length >= minLength &&
      worry.content.length <= maxLength
  );

  const validateWorry = (): boolean => {
    const content = worry.content.trim();

    if (!content) return false;
    if (content.length < minLength) return false;
    if (worry.content.length > maxLength) return false;

    return true;
  };

  watch(
    () => worry.content,
    value => {
      const content = value.trim();

      if (!content) {
        errorText.value = '';
        return;
      }

      if (content.length < minLength) {
        errorText.value = `고민을 좀 더 자세히 설명해주세요. (최소 ${minLength}자 이상)`;
        return;
      }

      if (value.length > maxLength) {
        errorText.value = `고민 내용이 너무 깁니다. (최대 ${maxLength}자 까지)`;
        return;
      }

      errorText.value = '';
    }
  );

  const resetWorry = () => {
    worry.content = '';
    worry.category = '';
    errorText.value = '';
  };

  return {
    minLength,
    maxLength,
    worry,
    errorText,
    isValid,
    validateWorry,
    resetWorry,
  };
}
