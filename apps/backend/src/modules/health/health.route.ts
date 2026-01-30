import { Router } from 'express';
import { healthController } from '@modules/health/health.controller';

export const healthRouter = Router();

healthRouter.get('/health', healthController);
