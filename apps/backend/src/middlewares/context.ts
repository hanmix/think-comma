import type { RequestHandler } from 'express';
import { hasContextId } from '../shared/contextMap';
import { createHttpErrorFromCode } from '../shared/errors';
import { ErrorCode } from '@myorg/shared';

export const requireAnonId: RequestHandler = (_req, res, next) => {
  const anonId = String(res.locals.anonId || '').trim();
  if (!anonId) {
    return next(createHttpErrorFromCode(400, ErrorCode.MISSING_ANON_ID));
  }
  res.locals.anonId = anonId;
  next();
};

export const requireContextId: RequestHandler = (req, res, next) => {
  const contextId =
    String(req.header('x-context-id') || req.body?.contextId || '').trim();
  if (!contextId) {
    return next(createHttpErrorFromCode(400, ErrorCode.MISSING_CONTEXT_ID));
  }
  const anonId = String(res.locals.anonId || '').trim();
  if (!anonId) {
    return next(createHttpErrorFromCode(400, ErrorCode.MISSING_ANON_ID));
  }
  if (!hasContextId(contextId, anonId)) {
    return next(createHttpErrorFromCode(400, ErrorCode.INVALID_CONTEXT_ID));
  }
  res.locals.contextId = contextId;
  res.locals.anonId = anonId;
  next();
};
