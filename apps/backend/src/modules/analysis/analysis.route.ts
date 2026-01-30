import { Router } from 'express';
import { requireContextId } from '@middlewares/context';
import { asyncHandler } from '@shared/asyncHandler';
import { analyzeController } from '@modules/analysis/analysis.controller';

export const analysisRouter = Router();

analysisRouter.post(
  '/analyze',
  requireContextId,
  asyncHandler(analyzeController)
);
