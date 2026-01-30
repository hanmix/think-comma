import { Router } from 'express';
import { asyncHandler } from '@shared/asyncHandler';
import { chatController } from '@modules/chat/chat.controller';

export const chatRouter = Router();

// Non-streaming only endpoint. Always responds exactly once.
chatRouter.post(
  '/chat',
  asyncHandler(chatController)
);
