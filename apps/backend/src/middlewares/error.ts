import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ERROR_CODES } from '../shared/errors';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      isSuccess: false,
      message: 'Invalid request',
      code: 'INVALID_REQUEST',
      data: { issues: err.issues },
    });
  }
  const status = (err && (err.status || err.statusCode)) || 500;
  const code =
    err?.code || (status >= 500 ? 'INTERNAL_SERVER_ERROR' : undefined);
  const message =
    err?.message ||
    (code
      ? ERROR_CODES[code as keyof typeof ERROR_CODES]
      : undefined) ||
    ERROR_CODES.INTERNAL_SERVER_ERROR;
  res.status(status).json({
    isSuccess: false,
    message,
    code,
    data: err?.data,
  });
};
