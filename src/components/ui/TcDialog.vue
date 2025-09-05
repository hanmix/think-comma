<template>
  <TcModal
    v-model="proxyValue"
    :title="title"
    :closable="closable"
    :closeOnBackdrop="closeOnBackdrop"
    :width="width"
    :hideHeader="true"
  >
    <TcCard size="lg" class="tc-dialog-card">
      <template v-if="$slots.header || title" #header>
        <slot name="header">
          <h3 class="tc-heading-3">{{ title }}</h3>
        </slot>
      </template>

      <slot />

      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </TcCard>
  </TcModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TcModal from './TcModal.vue';
import TcCard from './TcCard.vue';

interface Props {
  modelValue: boolean;
  title?: string;
  closable?: boolean;
  closeOnBackdrop?: boolean;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  closeOnBackdrop: true,
  width: 'min(92vw, 600px)'
});

const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>();
const proxyValue = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});
</script>

