import { FramingIntro } from '@/types/thinking';
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
