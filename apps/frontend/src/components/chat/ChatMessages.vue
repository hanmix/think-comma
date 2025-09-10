<template>
  <div class="chat-messages">
    <div v-for="(m, idx) in messages" :key="idx" class="msg" :class="m.role">
      <div class="bubble">
        {{ m.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@myorg/shared';

defineProps<{ messages: ChatMessage[] }>();
</script>

<style scoped>
.chat-messages {
  display: grid;
  gap: 8px;
}
.msg {
  display: flex;
}
.msg.user {
  justify-content: flex-end;
}
.msg.assistant {
  justify-content: flex-start;
}
.bubble {
  max-width: 75%;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f3f4f6;
  white-space: pre-wrap;
}
.msg.user .bubble {
  background: #2563eb;
  color: white;
}
</style>
