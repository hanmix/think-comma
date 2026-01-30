import OpenAI from 'openai';
import { env } from '../../config/env';

export function getClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw Object.assign(new Error('OPENAI_API_KEY is not set'), {
      status: 500,
    });
  }
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
  });
}

export function getModel(model?: string): string {
  return model || env.OPENAI_MODEL;
}

export function getTemperature(temp?: number): number {
  return temp ?? 0.5;
}
