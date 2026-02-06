import { generateJSON } from '@infra/openai';
import { buildQuestionsPrompt } from '@modules/questions/questions.prompts';
import { AIQuestionsSchema } from '@modules/questions/questions.schemas';
import { ErrorCode } from '@myorg/shared';
import { createHttpErrorFromCode, isHttpErrorLike } from '@shared/errors';
import {
  AIQuestionsResponse,
  ChoiceA,
  ChoiceB,
  NormalizedAIQuestion,
  NormalizedAIQuestionsResponse,
} from 'types/ai';

export function normalizeAIQuestions(
  parsed: AIQuestionsResponse,
  expected = 10
): NormalizedAIQuestionsResponse {
  const trimmed = parsed.questions.slice(0, expected);

  const normalized: NormalizedAIQuestion[] = trimmed.map((q, idx) => {
    const a = q.choices.find(c => c.id === 'A');
    const b = q.choices.find(c => c.id === 'B');

    const choiceA: ChoiceA = {
      id: 'A',
      content: (a?.content ?? '').trim(),
      ...(a?.description ? { description: a.description } : {}),
    };

    const choiceB: ChoiceB = {
      id: 'B',
      content: (b?.content ?? '').trim(),
      ...(b?.description ? { description: b.description } : {}),
    };

    return {
      id: idx + 1,
      text: q.text.trim(),
      choices: [choiceA, choiceB],
    };
  });

  return { questions: normalized };
}

export async function generateQuestions(
  worry: { content: string; category?: string },
  axis?: {
    axisA: string;
    axisB: string;
    rationaleA: string;
    rationaleB: string;
    keywords?: string[];
  }
) {
  try {
    const prompt = buildQuestionsPrompt({ worry, axis });
    const jsonData = await generateJSON<unknown>(prompt);
    try {
      const parsed = AIQuestionsSchema.parse(jsonData);
      const normalized = normalizeAIQuestions(parsed, 10);
      return normalized.questions;
    } catch {
      throw createHttpErrorFromCode(502, ErrorCode.QUESTIONS_AI_PARSE);
    }
  } catch (aiErr: unknown) {
    if (isHttpErrorLike(aiErr)) {
      throw aiErr;
    }
    console.error('Questions AI failed:', aiErr);
    throw createHttpErrorFromCode(502, ErrorCode.QUESTIONS_AI_FAILED);
  }
}
