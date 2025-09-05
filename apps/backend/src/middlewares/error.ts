import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Invalid request',
      issues: err.issues,
    });
  }
  const status = (err && (err.status || err.statusCode)) || 500;
  res.status(status).json({ error: err?.message || 'Internal Server Error' });
};
