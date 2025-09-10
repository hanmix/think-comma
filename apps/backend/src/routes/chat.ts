import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { generateText } from '../lib/openai';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000),
});
const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().optional().default(false),
});

export const chatRouter = Router();

// Non-streaming only endpoint. Always responds exactly once.
chatRouter.post('/chat', async (req, res) => {
  try {
    const parsed = ChatRequestSchema.parse(req.body);
    // force non-streaming to keep the connection lifecycle simple
    // and prevent chunked encoding issues.
    const payload = { ...parsed, stream: false };

    // Dev fallback if no API key is configured
    if (!env.OPENAI_API_KEY) {
      return res.status(200).json({
        content:
          '(dev) No OPENAI_API_KEY set. Please configure apps/backend/.env',
        model: payload.model,
      });
    }

    const content = await generateText(payload);
    return res.status(200).json({ content, model: payload.model });
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 500;
    const message = err?.message || 'Internal Server Error';
    return res.status(status).json({ error: message });
  }
});
