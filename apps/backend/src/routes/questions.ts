import { Router } from 'express';
import { z } from 'zod';
import { hasContextId } from '../lib/contextStore';
import { generateJSON } from '../lib/openai';
import { buildQuestionsPrompt } from '../lib/prompts';

const WorrySchema = z.object({
  content: z.string().min(1),
  category: z.string().optional(),
});

export const questionsRouter = Router();

const AIQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string(),
        choices: z
          .array(
            z.object({
              id: z.enum(['A', 'B']),
              content: z.string(),
              description: z.string().optional(),
            })
          )
          .length(2),
      })
    )
    .min(1),
});

function normalizeAI(ai: any) {
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
    const toContent = (c: any) =>
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

questionsRouter.post('/generate-questions', async (req, res) => {
  try {
    const body = z.object({ worry: WorrySchema }).parse(req.body);
    const contextId =
      String(req.header('x-context-id') || req.body?.contextId || '').trim();
    if (!contextId) {
      return res
        .status(400)
        .json({ isSuccess: false, message: 'contextId is required' });
    }
    const anonId = String(res.locals.anonId || '').trim();
    if (!anonId) {
      return res
        .status(400)
        .json({ isSuccess: false, message: 'Missing anonId' });
    }
    if (!hasContextId(contextId, anonId)) {
      return res
        .status(400)
        .json({ isSuccess: false, message: 'Invalid contextId' });
    }
    try {
      const prompt = buildQuestionsPrompt({ worry: body.worry });
      const ai = await generateJSON<{
        questions: Array<{
          text: string;
          choices: Array<{ id: 'A' | 'B'; content: string }>;
        }>;
      }>(prompt);
      try {
        const parsed = AIQuestionsSchema.parse(ai);
        const list = parsed.questions
          .slice(0, 10)
          .map((q, i) => ({ id: i + 1, text: q.text, choices: q.choices }));
        return res
          .status(200)
          .json({ isSuccess: true, data: { questions: list } });
      } catch {
        const list = normalizeAI(ai).map((q, i) => ({
          id: i + 1,
          text: q.text,
          choices: q.choices,
        }));
        if (list.length)
          return res
            .status(200)
            .json({ isSuccess: true, data: { questions: list } });
        throw Object.assign(new Error('AI parse failed'), { status: 502 });
      }
    } catch (aiErr) {
      console.error('Questions AI failed:', aiErr);
      throw Object.assign(new Error('Questions generation failed'), {
        status: 502,
      });
    }
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 400;
    return res
      .status(status)
      .json({ error: err?.message || 'Invalid request' });
  }
});
