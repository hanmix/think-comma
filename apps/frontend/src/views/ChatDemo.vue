<template>
  <div class="tc-container" style="max-width: 800px; margin: 24px auto;">
    <h1 class="tc-heading-2">Chat Demo</h1>
    <ChatMessages :messages="messages" />
    <div style="display:flex; gap:8px; align-items:center; margin-top:12px;">
      <ChatInput :disabled="isLoading" @submit="onSubmit" />
      <button class="tc-button" :disabled="!isLoading" @click="stop">중단</button>
    </div>
    <p v-if="error" class="tc-form-error" style="margin-top:8px;">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ChatInput, ChatMessages } from '@/components/ui';
import { useChat } from '@/composables/useChat';

const { messages, isLoading, error, send, stop } = useChat({ baseUrl: 'http://localhost:4000', stream: true });

function onSubmit(text: string) {
  send(text, { stream: true });
}
</script>
