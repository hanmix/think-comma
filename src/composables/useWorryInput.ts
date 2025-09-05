import type { WorryInput } from "@/types/thinking";
import { computed, reactive, ref } from "vue";

interface WorryRules {
  minLength?: number;
  maxLength?: number;
}

export function useWorryInput(rules: WorryRules = {}) {
  const { minLength = 10, maxLength = 1000 } = rules;

  const worry = reactive<WorryInput>({ content: "", category: "" });
  const error = ref<string>("");

  const isValid = computed(
    () =>
      worry.content.trim().length >= minLength &&
      worry.content.length <= maxLength
  );

  const validateWorry = (): boolean => {
    error.value = "";
    const content = worry.content.trim();

    if (!content) {
      error.value = "고민 내용을 입력해주세요.";
      return false;
    }

    if (content.length < minLength) {
      error.value = `고민을 좀 더 자세히 설명해주세요. (최소 ${minLength}자)`;
      return false;
    }

    if (worry.content.length > maxLength) {
      error.value = `고민 내용이 너무 깁니다. (최대 ${maxLength}자)`;
      return false;
    }

    return true;
  };

  const resetWorry = () => {
    worry.content = "";
    worry.category = "";
    error.value = "";
  };

  return { worry, error, isValid, validateWorry, resetWorry };
}
