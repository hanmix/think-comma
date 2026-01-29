import { Router } from 'express';
import { z } from 'zod';
import { createContextId } from '../lib/contextStore';
import { generateJSON } from '../lib/openai';
import { buildFramingPrompt } from '../lib/prompts';

const WorrySchema = z.object({
  content: z.string().min(1),
  category: z.string().optional(),
});

export const framingRouter = Router();

const FramingSchema = z.object({
  summary: z.string(),
  choiceALabel: z.string(),
  choiceBLabel: z.string(),
  aHint: z.string(),
  bHint: z.string(),
  cta: z.string(),
});

framingRouter.post('/framing', async (req, res) => {
  try {
    const body = z.object({ worry: WorrySchema }).parse(req.body);
    try {
      const prompt = buildFramingPrompt({ worry: body.worry });
      const ai = await generateJSON<z.infer<typeof FramingSchema>>(prompt);
      // normalize trivial labels like "A", "B"
      const trivial = (s?: string) => {
        if (!s) return true;
        const t = String(s).trim();
        if (!t) return true;
        if (t.length <= 2) return /^[AB]$/i.test(t);
        const letters = t.replace(/[^A-Za-z]/g, '').toUpperCase();
        return letters === 'A' || letters === 'B';
      };
      if (trivial(ai.choiceALabel) || trivial(ai.choiceBLabel)) {
        throw Object.assign(new Error('Invalid choice labels'), {
          status: 502,
        });
      }
      const summary = String(ai.summary || '').trim();
      if (!summary) {
        throw Object.assign(new Error('Invalid summary'), { status: 502 });
      }
      const aHint = String(ai.aHint || '').trim();
      const bHint = String(ai.bHint || '').trim();
      const cta = String(ai.cta || '').trim();
      if (!aHint || !bHint || !cta) {
        throw Object.assign(new Error('Invalid hints/cta'), { status: 502 });
      }
      const framing = {
        summary,
        choiceALabel: ai.choiceALabel,
        choiceBLabel: ai.choiceBLabel,
        aHint,
        bHint,
        cta,
      } as const;
      const anonId = String(res.locals.anonId || '').trim();
      if (!anonId) {
        throw Object.assign(new Error('Missing anonId'), { status: 400 });
      }
      const contextId = createContextId(anonId);
      return res
        .status(200)
        .json({ isSuccess: true, data: { framing, contextId } });
    } catch (aiErr: any) {
      console.error('Framing AI failed:', aiErr);
      throw Object.assign(new Error('Framing generation failed'), {
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
