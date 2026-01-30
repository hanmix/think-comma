import { Router } from 'express';
import { requireAnonId } from '@middlewares/context';
import { asyncHandler } from '@shared/asyncHandler';
import { generateFramingController } from '@modules/framing/framing.controller';

export const framingRouter = Router();

framingRouter.post(
  '/framing',
  requireAnonId,
  asyncHandler(generateFramingController)
);
