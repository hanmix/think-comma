<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="tc-modal"
      v-bind="attrs"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="hideHeader ? undefined : labelId"
      :aria-label="hideHeader && title ? title : undefined"
      @keydown.esc.prevent="onEsc"
    >
      <div class="tc-modal__backdrop" @click="onBackdropClick" />

      <div
        class="tc-modal__container"
        :style="containerStyle"
        ref="containerRef"
        tabindex="-1"
      >
        <div class="tc-modal__sentinel" tabindex="0" @focus="focusLast" />

        <header
          class="tc-modal__header"
          v-if="!hideHeader && ($slots.header || title)"
        >
          <div class="tc-modal__title" :id="labelId">
            <slot name="header">{{ title }}</slot>
          </div>
          <button
            v-if="closable"
            type="button"
            class="tc-modal__close"
            aria-label="닫기"
            @click="close"
          >
            ×
          </button>
        </header>

        <section class="tc-modal__body">
          <slot />
        </section>

        <footer class="tc-modal__footer" v-if="$slots.footer">
          <slot name="footer" />
        </footer>

        <div class="tc-modal__sentinel" tabindex="0" @focus="focusFirst" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useAttrs, watch } from 'vue';

defineOptions({ inheritAttrs: false });

interface Props {
  modelValue: boolean;
  title?: string;
  closable?: boolean;
  closeOnBackdrop?: boolean;
  width?: string; // e.g., '600px' or 'min(90vw, 600px)'
  hideHeader?: boolean; // when true, header is visually hidden (use custom header)
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  closeOnBackdrop: true,
  width: 'min(92vw, 600px)',
  hideHeader: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const attrs = useAttrs();
const containerRef = ref<HTMLDivElement | null>(null);
const previouslyFocused = ref<HTMLElement | null>(null);
const uid = crypto.getRandomValues(new Uint32Array(1))[0];
const labelId = `tc-modal-title-${uid}`;

const containerStyle = computed(() => ({ maxWidth: props.width }));

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const onBackdropClick = () => {
  if (props.closeOnBackdrop) close();
};

const onEsc = () => {
  if (props.closable) close();
};

const getFocusable = () => {
  const root = containerRef.value;
  if (!root) return [] as HTMLElement[];
  const selectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return Array.from(root.querySelectorAll<HTMLElement>(selectors)).filter(
    el =>
      !el.hasAttribute('disabled') &&
      !el.getAttribute('aria-hidden') &&
      !el.classList.contains('tc-modal__sentinel')
  );
};

const focusFirst = () => {
  const els = getFocusable();
  (els[0] || containerRef.value)?.focus();
};
const focusLast = () => {
  const els = getFocusable();
  (els[els.length - 1] || containerRef.value)?.focus();
};

watch(
  () => props.modelValue,
  open => {
    if (open) {
      previouslyFocused.value = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      // Defer focus to next tick
      setTimeout(() => focusFirst(), 0);
    } else {
      document.body.style.overflow = '';
      previouslyFocused.value?.focus?.();
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    previouslyFocused.value = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    setTimeout(() => focusFirst(), 0);
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
  previouslyFocused.value = null;
});
</script>

<script lang="ts">
import './TcModal.scss';
export default {};
</script>
