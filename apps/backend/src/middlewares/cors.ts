import cors from 'cors';
import type { RequestHandler } from 'express';
import { env } from '../config/env';

export const corsMiddleware = (): RequestHandler =>
  cors({
    origin: env.CORS_ORIGIN || true,
    credentials: false,
  });
