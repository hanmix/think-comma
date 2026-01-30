import type { RequestHandler } from 'express';
import { buildHealthResponse } from '@modules/health/health.service';

export const healthController: RequestHandler = (_req, res) => {
  return res.json(buildHealthResponse());
};
