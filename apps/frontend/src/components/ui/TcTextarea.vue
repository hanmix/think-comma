<template>
  <div class="tc-form-group">
    <label v-if="label" :for="textareaId" :class="labelClasses">
      {{ label }}
    </label>

    <textarea
      :id="textareaId"
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :class="textareaClasses"
      :rows="rows"
      :maxlength="maxlength"
      :aria-describedby="ariaDescribedby || undefined"
      :aria-invalid="ariaInvalid === true ? 'true' : undefined"
      @focus="(e) => $emit('focus', e)"
      @blur="(e) => $emit('blur', e)"
    />

    <div v-if="helpText && !error" class="tc-form-help">
      {{ helpText }}
    </div>

    <div v-if="error" class="tc-form-error">
      {{ error }}
    </div>

    <div v-if="success" class="tc-form-success">
      {{ success }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  rows?: number | string;
  maxlength?: number | string;
  ariaDescribedby?: string;
  ariaInvalid?: boolean;
  textareaClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  disabled: false,
  readonly: false,
  required: false,
  rows: 4,
  maxlength: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
  textareaClass: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const textareaId = ref(`tc-textarea-${Math.random().toString(36).slice(2, 9)}`);

const localValue = computed({
  get: () => props.modelValue,
  set: (val: string) => emit("update:modelValue", val),
});

const labelClasses = computed(() => [
  "tc-form-label",
  { "tc-form-label--required": props.required },
]);

const textareaClasses = computed(() => [
  "tc-textarea",
  props.textareaClass,
]);
</script>
