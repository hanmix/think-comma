import type { RequestHandler } from 'express';
import { z } from 'zod';
import { createChatResponse } from '@modules/chat/chat.service';

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

export const chatController: RequestHandler = async (req, res) => {
  const parsed = ChatRequestSchema.parse(req.body);
  const response = await createChatResponse(parsed);
  return res.status(200).json(response);
};
