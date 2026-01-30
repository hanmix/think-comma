import { ERROR_CODES } from '@myorg/shared';
import type { ErrorCode as SharedErrorCode } from '@myorg/shared';

export { ERROR_CODES };
export type ErrorCodeType = SharedErrorCode;

export type HttpError = Error & {
  status?: number;
  statusCode?: number;
  code?: ErrorCodeType;
  data?: unknown;
};

export function isHttpErrorLike(
  err: unknown
): err is { status?: number; statusCode?: number } {
  return (
    !!err &&
    typeof err === 'object' &&
    ('status' in err || 'statusCode' in err)
  );
}

export function createHttpError(
  status: number,
  message: string,
  code?: ErrorCodeType,
  data?: unknown
): HttpError {
  const err = new Error(message) as HttpError;
  err.status = status;
  err.code = code;
  err.data = data;
  return err;
}

export function createHttpErrorFromCode(
  status: number,
  code: ErrorCodeType,
  data?: unknown
): HttpError {
  const message = ERROR_CODES[code] || ERROR_CODES.INTERNAL_SERVER_ERROR;
  return createHttpError(status, message, code, data);
}
