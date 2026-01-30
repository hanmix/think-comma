import { env } from '@config/env';
import { generateText } from '@infra/openai';
import type { GenerateParams } from '@infra/openai/types';

export async function createChatResponse(payload: GenerateParams) {
  const enforcedPayload = { ...payload, stream: false };
  if (!env.OPENAI_API_KEY) {
    return {
      content:
        '(dev) No OPENAI_API_KEY set. Please configure apps/backend/.env',
      model: enforcedPayload.model,
    } as const;
  }

  const content = await generateText(enforcedPayload);
  return { content, model: enforcedPayload.model } as const;
}
