<template>
  <div
    v-show="open"
    class="tc-dropdown__overlay"
    :class="{ 'is-up': direction === 'up' }"
    @keydown.capture.prevent.stop="onOverlayKeydown"
  >
    <ul
      :id="listboxId"
      class="tc-dropdown__list"
      role="listbox"
      :aria-labelledby="labelledby || undefined"
      tabindex="-1"
      ref="listEl"
    >
      <li
        v-if="showPlaceholder"
        class="tc-dropdown__option tc-dropdown__option--placeholder"
        role="option"
        :aria-selected="modelValue === '' ? 'true' : 'false'"
        :data-index="-1"
        @mousedown.prevent="emitSelect(placeholderValue)"
      >
        {{ placeholderLabel }}
      </li>

      <li
        v-for="(opt, idx) in options"
        :key="opt.value"
        class="tc-dropdown__option"
        role="option"
        :aria-selected="opt.value === modelValue ? 'true' : 'false'"
        :aria-disabled="opt.disabled ? 'true' : undefined"
        :data-index="idx"
        :class="{
          'is-active': idx === activeIndex,
          'is-selected': opt.value === modelValue,
          'is-disabled': opt.disabled,
        }"
        @mousemove="() => (activeIndex = idx)"
        @mousedown.prevent="() => !opt.disabled && emitSelect(opt.value)"
      >
        <span class="tc-dropdown__option-label">{{ opt.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { DropdownOption } from '@/composables';
import { ref, watch } from 'vue';
import './TcDropdown.scss';

interface Props {
  open: boolean;
  modelValue?: string;
  options: DropdownOption[];
  placeholderLabel?: string;
  placeholderValue?: string;
  showPlaceholder?: boolean;
  direction?: 'down' | 'up';
  listboxId?: string;
  labelledby?: string;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  modelValue: '',
  options: () => [],
  placeholderLabel: '선택',
  placeholderValue: '',
  showPlaceholder: true,
  direction: 'down' as const,
});

const emit = defineEmits<{
  select: [value: string];
  requestClose: [];
}>();

const activeIndex = ref<number>(-1);
const listEl = ref<HTMLElement | null>(null);

watch(
  () => props.open,
  val => {
    if (val) {
      // 키보드 접근을 위해 리스트에 포커스
      requestAnimationFrame(() => listEl.value?.focus());
      const idx = props.options.findIndex(o => o.value === props.modelValue);
      activeIndex.value = idx >= 0 ? idx : 0;
    }
  }
);

function emitSelect(val: string) {
  emit('select', val);
}

function setActive(idx: number) {
  if (idx < 0 || idx >= props.options.length) return;
  if (props.options[idx]?.disabled) return;
  activeIndex.value = idx;
  const el = listEl.value?.querySelector<HTMLElement>(`[data-index="${idx}"]`);
  el?.scrollIntoView({ block: 'nearest' });
}

function moveActive(delta: number) {
  const opts = props.options;
  if (!opts.length) return;
  let idx = activeIndex.value;
  for (let i = 0; i < opts.length; i++) {
    idx = (idx + delta + opts.length) % opts.length;
    if (!opts[idx]?.disabled) break;
  }
  setActive(idx);
}

function onOverlayKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') moveActive(1);
  else if (e.key === 'ArrowUp') moveActive(-1);
  else if (e.key === 'Home') setActive(0);
  else if (e.key === 'End') setActive(props.options.length - 1);
  else if (e.key === 'Enter') {
    const idx = activeIndex.value;
    if (idx >= 0 && idx < props.options.length) {
      const opt = props.options[idx];
      if (!opt || opt.disabled) return;
      emitSelect(opt.value);
    }
  } else if (e.key === 'Escape') emit('requestClose');
}
</script>
