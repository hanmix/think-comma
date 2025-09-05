import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 reqs/min per IP
  standardHeaders: true,
  legacyHeaders: false,
});
