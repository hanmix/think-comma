<template>
  <div class="tc-form-group tc-dropdown" ref="rootEl">
    <label v-if="label" :for="triggerId" :class="labelClasses">
      {{ label }}
    </label>

    <div class="tc-dropdown__anchor">
      <button
        :id="triggerId"
        ref="triggerEl"
        class="tc-select tc-dropdown__trigger"
        type="button"
        :disabled="disabled"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="open ? listboxId : undefined"
        role="combobox"
        aria-autocomplete="list"
        :aria-haspopup="'listbox'"
        @click="toggle"
        @keydown="onTriggerKeydown"
        @focus="e => $emit('focus', e)"
        @blur="e => $emit('blur', e)"
      >
        <span
          class="tc-dropdown__text"
          :class="{ 'tc-text-muted': !selectedLabel }"
        >
          {{ selectedLabel || placeholder || placeholderLabel }}
        </span>
        <span class="tc-dropdown__chevron" aria-hidden="true">▾</span>
      </button>

      <div
        v-show="open"
        ref="overlayEl"
        class="tc-dropdown__overlay"
        :class="{ 'is-up': direction === 'up' }"
        @keydown.capture.prevent.stop="onOverlayKeydown"
      >
        <ul
          :id="listboxId"
          class="tc-dropdown__list"
          role="listbox"
          :aria-labelledby="triggerId"
        >
          <li
            v-if="showPlaceholder"
            class="tc-dropdown__option tc-dropdown__option--placeholder"
            role="option"
            :aria-selected="(modelValue || '') === '' ? 'true' : 'false'"
            :data-index="-1"
            @mousedown.prevent="selectValue(placeholderValue)"
          >
            {{ placeholderLabel }}
          </li>

          <li
            v-for="(opt, idx) in options"
            :key="opt.value"
            class="tc-dropdown__option"
            role="option"
            :aria-selected="opt.value === (modelValue || '') ? 'true' : 'false'"
            :aria-disabled="opt.disabled ? 'true' : undefined"
            :data-index="idx"
            :class="{
              'is-active': idx === activeIndex,
              'is-selected': opt.value === (modelValue || ''),
              'is-disabled': opt.disabled,
            }"
            @mousemove="() => (activeIndex = idx)"
            @mousedown.prevent="() => !opt.disabled && selectValue(opt.value)"
          >
            <span class="tc-dropdown__option-label">{{ opt.label }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="helpText && !error" class="tc-form-help">{{ helpText }}</div>
    <div v-if="error" class="tc-form-error">{{ error }}</div>
    <div v-if="success" class="tc-form-success">{{ success }}</div>
  </div>
</template>

<script setup lang="ts">
import { useDropdown, type DropdownOption } from '@/composables';
import { computed } from 'vue';
import './TcSelect.scss';

interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  options: DropdownOption[];
  placeholderLabel?: string;
  placeholderValue?: string;
  showPlaceholder?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  required: false,
  options: () => [],
  placeholderLabel: '선택',
  placeholderValue: '',
  showPlaceholder: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const dropdown = useDropdown({
  options: () => props.options,
  value: () => props.modelValue || '',
  disabled: () => !!props.disabled,
  maxHeight: () => 320,
  onSelect: val => emit('update:modelValue', val),
});

const rootEl = dropdown.rootEl;
const triggerEl = dropdown.triggerEl;
const overlayEl = dropdown.overlayEl;
const triggerId = dropdown.triggerId;
const listboxId = dropdown.listboxId;
const open = dropdown.open;
const activeIndex = dropdown.activeIndex;
const direction = dropdown.direction;
const toggle = dropdown.toggle;
const onTriggerKeydown = dropdown.onTriggerKeydown;
const onOverlayKeydown = dropdown.onOverlayKeydown;
const selectValue = dropdown.selectValue;

const selectedLabel = computed(
  () => dropdown.selectedOption.value?.label || ''
);

const labelClasses = computed(() => [
  'tc-form-label',
  { 'tc-form-label--required': props.required },
]);
</script>
