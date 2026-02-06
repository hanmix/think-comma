import { useThinkingStore } from '@/stores/thinking';
import type {
  AnalysisResult,
  ApiResponse,
  FramingDTO,
  FramingIntro,
  Question,
  UserResponse,
  WorryInput,
} from '@/types';
import { ApiError } from '@/utils';
import axios, { AxiosRequestConfig } from 'axios';

const baseUrl = 'http://localhost:4000';
const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(config => {
  try {
    const store = useThinkingStore();
    const contextId = store?.state?.contextId;
    if (contextId) {
      config.headers = config.headers || {};
      if (!('x-context-id' in config.headers)) {
        config.headers['x-context-id'] = contextId;
      }
    }
  } catch {
    // no-op: store may not be ready during early init
  }
  return config;
});

const requestApi = async <T>(
  apiConfig: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const resp = await axiosInstance(apiConfig);
    return resp.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as any;
      const message =
        data?.message || (status ? `HTTP ${status}` : error.message);
      throw new ApiError(message, data?.code, status);
    }
    throw error;
  }
};

const generateQuestions = async (
  worry: WorryInput,
  axis?: FramingIntro['axis']
): Promise<Question[]> => {
  const res = await requestApi<{ questions: Question[] }>({
    url: '/api/generate-questions',
    method: 'post',
    data: { worry, axis },
  });

  return res.data.questions;
};

const generateFraming = async (
  worry: WorryInput
): Promise<{ framing: FramingIntro; contextId: string }> => {
  const res = await requestApi<FramingDTO>({
    url: '/api/framing',
    method: 'post',
    data: { worry },
  });
  return res.data;
};

const generateAnalysis = async (
  worry: WorryInput,
  questions: Question[],
  responses: UserResponse[],
  labels?: { choiceALabel?: string; choiceBLabel?: string },
  axis?: FramingIntro['axis']
): Promise<AnalysisResult> => {
  const payloadResponses = responses.map(r => ({
    questionId: r.questionId,
    answer: r.selectedChoice,
  }));
  const res = await requestApi<{ result: AnalysisResult }>({
    url: '/api/analyze',
    method: 'post',
    data: {
      worry,
      questions,
      responses: payloadResponses,
      labels,
      axis,
    },
  });
  return { ...res.data.result, responses };
};

export const aiService = {
  generateQuestions,
  generateFraming,
  generateAnalysis,
};
