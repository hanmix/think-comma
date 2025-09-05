import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

export const requestIdMiddleware: RequestHandler = (req, _res, next) => {
  const hdr = req.header('x-request-id');
  (req as any).requestId = hdr || randomUUID();
  next();
};
