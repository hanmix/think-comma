import { Router } from 'express';
import { asyncHandler } from '@shared/asyncHandler';
import { chatController } from '@modules/chat/chat.controller';

export const chatRouter = Router();

// 스트리밍 미지원 엔드포인트. 항상 한 번만 응답.
chatRouter.post(
  '/chat',
  asyncHandler(chatController)
);
