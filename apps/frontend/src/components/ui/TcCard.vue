<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <header v-if="title || $slots.header" class="tc-card__header">
      <slot name="header">
        <h3 v-if="title" class="tc-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="tc-card__subtitle">{{ subtitle }}</p>
      </slot>
    </header>
    
    <div class="tc-card__body">
      <slot />
    </div>
    
    <footer v-if="$slots.footer" class="tc-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface TcCardProps {
  variant?: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
  hoverable?: boolean;
}

const props = withDefaults(defineProps<TcCardProps>(), {
  variant: 'default',
  size: 'md',
  hoverable: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const cardClasses = computed(() => [
  'tc-card',
  `tc-card--${props.size}`,
  {
    [`tc-card--${props.variant}`]: props.variant !== 'default',
    'tc-card--hoverable': props.hoverable,
  },
]);

const handleClick = (event: MouseEvent) => {
  if (props.hoverable) {
    emit('click', event);
  }
};
</script>