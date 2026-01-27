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
      :minlength="minLength"
      :maxlength="maxlength"
      :aria-describedby="ariaDescribedby || undefined"
      :aria-invalid="ariaInvalid === true ? 'true' : undefined"
      @compositionstart="onCompositionStart"
      @compositionupdate="onCompositionUpdate"
      @compositionend="onCompositionEnd"
      @input="onInput"
      @focus="e => $emit('focus', e)"
      @blur="e => $emit('blur', e)"
    />

    <div
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <div v-if="helpText && !errorText" class="tc-form-help">
        {{ helpText }}
      </div>

      <div v-if="errorText" class="tc-form-error">
        {{ errorText }}
      </div>

      <div class="character-count">
        <span
          :class="{
            'text-warning': displayLength > 800,
            'text-error': displayLength >= 1000,
          }"
          :id="textareaId"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ displayLength }}
        </span>
        <span class="tc-text-muted">{{ `/ ${maxlength}자` }}</span>
      </div>
    </div>

    <div v-if="success" class="tc-form-success">
      {{ success }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  errorText?: string;
  success?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  rows?: number | string;
  minLength?: number | string;
  maxlength?: number | string;
  ariaDescribedby?: string;
  ariaInvalid?: boolean;
  textareaClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  readonly: false,
  required: false,
  rows: 4,
  minLength: undefined,
  maxlength: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
  textareaClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const textareaId = ref(`tc-textarea-${Math.random().toString(36).slice(2, 9)}`);

const localValue = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
});

const isComposing = ref(false);
const composingValue = ref('');

const displayLength = computed(() =>
  isComposing.value ? composingValue.value.length : localValue.value.length
);

const onCompositionStart = (event: CompositionEvent) => {
  isComposing.value = true;
  composingValue.value = (event.target as HTMLTextAreaElement).value;
};

const onCompositionUpdate = (event: CompositionEvent) => {
  composingValue.value = (event.target as HTMLTextAreaElement).value;
};

const onCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false;
  composingValue.value = (event.target as HTMLTextAreaElement).value;
};

const onInput = (event: Event) => {
  if (!isComposing.value) return;
  composingValue.value = (event.target as HTMLTextAreaElement).value;
};

const labelClasses = computed(() => [
  'tc-form-label',
  { 'tc-form-label--required': props.required },
]);

const textareaClasses = computed(() => ['tc-textarea', props.textareaClass]);
</script>
