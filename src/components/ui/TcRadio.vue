<template>
  <label
    class="tc-cluster"
    style="gap: var(--tc-spacing-2); align-items: center"
  >
    <input
      type="radio"
      class="tc-radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="tc-small-text"
      ><slot>{{ label }}</slot></span
    >
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number;
  value: string | number;
  name: string;
  label?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>
