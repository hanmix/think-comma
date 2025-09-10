import type { ChatMessage, ChatRequest } from '@myorg/shared';
import { ref } from 'vue';

interface Options {
  baseUrl?: string; // e.g., http://localhost:4000
  stream?: boolean;
}

export function useChat(opts: Options = {}) {
  const baseUrl = opts.baseUrl || 'http://localhost:4000';
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const isStreaming = ref(false);
  const controller = ref<AbortController | null>(null);
  const error = ref('');

  async function send(input: string) {
    error.value = '';
    if (!input.trim()) return;

    // push user message
    messages.value.push({ role: 'user', content: input });
    isLoading.value = true;
    try {
      const body: ChatRequest = { messages: messages.value, stream: false };
      const resp = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      messages.value.push({ role: 'assistant', content: json.content || '' });
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        // aborted by user; keep partial content
      } else {
        error.value = e?.message || 'Failed to send message';
      }
    } finally {
      isLoading.value = false;
      isStreaming.value = false;
      controller.value = null;
    }
  }

  function reset() {
    messages.value = [];
    error.value = '';
    isLoading.value = false;
  }

  function stop() {
    controller.value?.abort();
  }

  return { messages, isLoading, isStreaming, error, send, reset, stop };
}
