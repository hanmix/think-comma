<template>
  <form class="chat-input" @submit.prevent="onSubmit">
    <textarea
      v-model="input"
      class="tc-textarea"
      rows="3"
      placeholder="메시지를 입력하세요..."
      :disabled="disabled"
    />
    <div class="actions">
      <button
        class="tc-button"
        type="submit"
        :disabled="disabled || !input.trim()"
      >
        보내기
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ disabled?: boolean }>();
const emit = defineEmits<{ submit: [text: string] }>();

const input = ref('');

function onSubmit() {
  const text = input.value.trim();
  if (!text) return;
  emit('submit', text);
  input.value = '';
}
</script>

<style scoped>
.chat-input {
  display: grid;
  gap: 8px;
}
.actions {
  text-align: right;
}
.tc-button {
  padding: 8px 12px;
}
</style>
