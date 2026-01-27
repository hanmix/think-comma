import type {
  AnalysisResult,
  FramingIntro,
  Question,
  UserResponse,
  WorryInput,
} from '@/types';
import axios from 'axios';

const baseUrl = 'http://localhost:4000';

const requestApi = async <T>(path: string, body: any): Promise<T> => {
  try {
    const resp = await axios.post<T>(`${baseUrl}${path}`, body);
    return resp.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        (error.response?.data as any)?.error ||
        (status ? `HTTP ${status}` : error.message);
      throw new Error(message);
    }
    throw error;
  }
};

const generateQuestions = async (worry: WorryInput): Promise<Question[]> => {
  const data = await requestApi<{ questions: Question[] }>(
    '/api/generate-questions',
    { worry }
  );
  return data.questions;
};

const generateFraming = async (
  worry: WorryInput,
  sessionId?: string
): Promise<FramingIntro> => {
  const data = await requestApi<{ framing: FramingIntro }>('/api/framing', {
    worry,
    sessionId,
  });
  return data.framing;
};

const generateAnalysis = async (
  worry: WorryInput,
  questions: Question[],
  responses: UserResponse[],
  labels?: { choiceALabel?: string; choiceBLabel?: string },
  sessionId?: string
): Promise<AnalysisResult> => {
  const payloadResponses = responses.map(r => ({
    questionId: r.questionId,
    answer: r.selectedChoice,
  }));
  const data = await requestApi<{ result: AnalysisResult }>('/api/analyze', {
    worry,
    questions,
    responses: payloadResponses,
    labels,
    sessionId,
  });
  return { ...data.result, responses };
};

export const aiService = {
  generateQuestions,
  generateFraming,
  generateAnalysis,
};
