<template>
  <div class="tc-form-group">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
    </label>

    <input
      :id="inputId"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :class="inputClasses"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
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
import { computed, ref } from 'vue';

interface TcInputProps {
  modelValue?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
}

const props = withDefaults(defineProps<TcInputProps>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const inputId = ref(`tc-input-${Math.random().toString(36).substr(2, 9)}`);

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

const labelClasses = computed(() => [
  'tc-form-label',
  {
    'tc-form-label--required': props.required,
  },
]);

const inputClasses = computed(() => [
  'tc-input',
  {
    'tc-input--error': props.error,
    'tc-input--success': props.success,
  },
]);

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>
