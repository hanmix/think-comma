import { ERROR_CODES } from '@myorg/shared';
import type { ErrorCodeType } from '@myorg/shared';

export class ApiError extends Error {
  code?: ErrorCodeType;
  status?: number;

  constructor(message: string, code?: ErrorCodeType, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function toApiError(err: unknown): ApiError | null {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) {
    return new ApiError(err.message);
  }
  return null;
}

const defaultMessage = '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';

const codeMessageMap: Partial<Record<ErrorCodeType, string>> = {
  INVALID_REQUEST: '요청이 올바르지 않습니다. 입력 내용을 확인해주세요.',
  MISSING_ANON_ID: '세션 정보가 없습니다. 처음부터 다시 시작해주세요.',
  MISSING_CONTEXT_ID: '세션 정보가 없습니다. 처음부터 다시 시작해주세요.',
  INVALID_CONTEXT_ID: '세션이 만료되었습니다. 처음부터 다시 시작해주세요.',
  INVALID_LABELS: '선택지 라벨이 올바르지 않습니다. 다시 시도해주세요.',
  INVALID_AI_LABELS: 'AI 응답 처리 중 오류가 발생했습니다.',
  INVALID_AI_SUMMARY: 'AI 요약 처리 중 오류가 발생했습니다.',
  INVALID_AI_HINTS: 'AI 힌트 처리 중 오류가 발생했습니다.',
  QUESTIONS_AI_PARSE: 'AI 응답 파싱 중 오류가 발생했습니다.',
  QUESTIONS_AI_FAILED: 'AI 질문 생성 중 오류가 발생했습니다.',
  FRAMING_AI_FAILED: 'AI 초기 구성 중 오류가 발생했습니다.',
  ANALYSIS_AI_FAILED: 'AI 분석 중 오류가 발생했습니다.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다. 다시 시도해주세요.',
};

export function getErrorMessage(
  code?: ErrorCodeType,
  fallback?: string
): string {
  if (code && codeMessageMap[code]) return codeMessageMap[code] as string;
  if (code && ERROR_CODES[code]) return ERROR_CODES[code];
  return fallback || defaultMessage;
}
