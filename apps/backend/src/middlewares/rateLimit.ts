import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 60, // IP당 분당 60회 요청
  standardHeaders: true,
  legacyHeaders: false,
});
