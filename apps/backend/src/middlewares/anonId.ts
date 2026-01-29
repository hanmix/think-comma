import { randomUUID } from 'crypto';
import type { RequestHandler } from 'express';

const COOKIE_NAME = 'anon_id';

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

export const anonIdMiddleware: RequestHandler = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  let anonId = cookies[COOKIE_NAME];
  if (!anonId) {
    anonId = randomUUID();
    res.cookie(COOKIE_NAME, anonId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }
  res.locals.anonId = anonId;
  next();
};
