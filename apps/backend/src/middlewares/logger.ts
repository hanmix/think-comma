import pino from 'pino';
import type { RequestHandler } from 'express';

export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const loggerMiddleware: RequestHandler = (req, res, next) => {
  const start = Date.now();
  const id = (req as any).requestId;
  logger.info({ id, method: req.method, url: req.url }, 'request start');
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info({ id, status: res.statusCode, ms }, 'request end');
  });
  next();
};
