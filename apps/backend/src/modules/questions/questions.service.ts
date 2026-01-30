import { ErrorCode } from '@myorg/shared';
import { generateJSON } from '@infra/openai';
import { createHttpErrorFromCode, isHttpErrorLike } from '@shared/errors';
import { buildQuestionsPrompt } from '@modules/questions/questions.prompts';
import { AIQuestionsSchema } from '@modules/questions/questions.schemas';

type RawChoice = string | { content?: string; text?: string };
type RawQuestion = {
  text?: string;
  question?: string;
  title?: string;
  choices?: RawChoice[];
  options?: RawChoice[];
  answers?: RawChoice[];
};
type RawQuestionsPayload = {
  questions?: RawQuestion[];
  items?: RawQuestion[];
  list?: RawQuestion[];
};

function normalizeAI(ai: RawQuestionsPayload) {
  const list = ai?.questions || ai?.items || ai?.list || [];
  const out: Array<{
    text: string;
    choices: Array<{ id: 'A' | 'B'; content: string }>;
  }> = [];
  for (const it of list) {
    const text = it?.text || it?.question || it?.title || '';
    let choices = it?.choices || it?.options || it?.answers || [];
    if (!Array.isArray(choices)) choices = [];
    const a = choices[0];
    const b = choices[1];
    const toContent = (c: RawChoice) =>
      typeof c === 'string' ? c : c?.content || c?.text || '';
    const A = toContent(a);
    const B = toContent(b);
    if (text && A && B)
      out.push({
        text,
        choices: [
          { id: 'A', content: A },
          { id: 'B', content: B },
        ],
      });
    if (out.length >= 10) break;
  }
  return out;
}

export async function generateQuestions(worry: {
  content: string;
  category?: string;
}) {
  try {
    const prompt = buildQuestionsPrompt({ worry });
    const ai = await generateJSON<unknown>(prompt);
    try {
      const parsed = AIQuestionsSchema.parse(ai);
      return parsed.questions
        .slice(0, 10)
        .map((q, i) => ({ id: i + 1, text: q.text, choices: q.choices }));
    } catch {
      const list = normalizeAI(ai as RawQuestionsPayload).map((q, i) => ({
        id: i + 1,
        text: q.text,
        choices: q.choices,
      }));
      if (list.length) return list;
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
