import type { FramingIntro } from '@/types';
import type { ErrorCodeType } from '@myorg/shared';

export interface ApiResponse<T> {
  isSuccess: boolean;
  code?: ErrorCodeType;
  message?: string;
  data: T;
}

export interface FramingDTO {
  framing: FramingIntro;
  contextId: string;
}
