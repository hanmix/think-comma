import { FramingIntro } from '@/types/thinking';

export interface ApiResponse<T> {
  isSuccess: boolean;
  code?: number;
  message?: string;
  data: T;
}

export interface FramingDTO {
  framing: FramingIntro;
  contextId: string;
}
