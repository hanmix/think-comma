<template>
  <label class="tc-cluster" style="gap: var(--tc-spacing-2); align-items: center;">
    <input
      type="checkbox"
      class="tc-checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="tc-small-text"><slot>{{ label }}</slot></span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>

