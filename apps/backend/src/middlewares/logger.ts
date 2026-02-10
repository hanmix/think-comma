import { randomUUID } from 'crypto';
import type { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import pino from 'pino';

// ----------------------------
// 설정
// ----------------------------
const LOG_DIR = path.join(process.cwd(), 'logs');
// ----------------------------
// 로그 레벨
// trace (10)
// debug (20)
// info (30)
// warn (40)
// error (50)
// fatal (60)
// ----------------------------
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
// KST는 UTC+9(서머타임 없음)
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// ----------------------------
// FS 헬퍼
// ----------------------------
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function formatKSTDateStamp(dateUTC = new Date()): string {
  // 현재 시간을 고정 오프셋으로 KST로 변환한 뒤 YYYY-MM-DD 포맷
  const kst = new Date(dateUTC.getTime() + KST_OFFSET_MS);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function logPathFor(dateStamp: string): string {
  return path.join(LOG_DIR, `${dateStamp}.txt`);
}

// ----------------------------
// 단순 일자별 파일 목적지(프리티파이어/타이머 없음)
// ----------------------------
ensureLogDir();

let currentDate = formatKSTDateStamp();
let destination = pino.destination({
  dest: logPathFor(currentDate),
  append: true,
  sync: true,
});
let baseLogger = pino({ level: LOG_LEVEL }, destination);

function rotateIfNeeded() {
  const today = formatKSTDateStamp();
  if (today !== currentDate) {
    try {
      destination.end?.();
    } catch {}
    currentDate = today;
    destination = pino.destination({
      dest: logPathFor(currentDate),
      append: true,
      sync: true,
    });
    baseLogger = pino({ level: LOG_LEVEL }, destination);
  }
}

// ----------------------------
// 미들웨어
// ----------------------------
export const loggerMiddleware: RequestHandler = (req, res, next) => {
  rotateIfNeeded();
  const start = Date.now();
  const id = req.requestId ?? randomUUID();
  req.requestId = id;

  baseLogger.info(
    {
      id,
      method: req.method,
      url: req.originalUrl || req.url,
      ReportBody: req.body,
    },
    'request start'
  );

  res.on('finish', () => {
    const ms = Date.now() - start;
    baseLogger.info({ id, status: res.statusCode, ms }, 'request end');
  });

  res.on('close', () => {
    if (!res.writableEnded) {
      const ms = Date.now() - start;
      baseLogger.warn({ id, aborted: true, ms }, 'request aborted');
    }
  });

  next();
};
