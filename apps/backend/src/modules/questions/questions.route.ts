import { Router } from 'express';
import { requireContextId } from '@middlewares/context';
import { asyncHandler } from '@shared/asyncHandler';
import { generateQuestionsController } from '@modules/questions/questions.controller';

export const questionsRouter = Router();

questionsRouter.post(
  '/generate-questions',
  requireContextId,
  asyncHandler(generateQuestionsController)
);
