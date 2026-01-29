import { Router } from 'express';
import { z } from 'zod';
import { hasContextId } from '../lib/contextStore';
import { generateJSON } from '../lib/openai';
import { buildAnalysisPrompt } from '../lib/prompts';

const ChoiceSchema = z.object({ id: z.enum(['A', 'B']), content: z.string() });
const QuestionSchema = z.object({
  id: z.number(),
  text: z.string(),
  choices: z.array(ChoiceSchema),
});
const ResponseSchema = z.object({
  questionId: z.number(),
  answer: z.enum(['A', 'B']),
});
const WorrySchema = z.object({
  content: z.string().min(1),
  category: z.string().optional(),
});

export const analysisRouter = Router();

analysisRouter.post('/analyze', async (req, res) => {
  try {
    const body = z
      .object({
        worry: WorrySchema,
        questions: z.array(QuestionSchema),
        responses: z.array(ResponseSchema),
        labels: z
          .object({
            choiceALabel: z.string().optional(),
            choiceBLabel: z.string().optional(),
          })
          .optional(),
      })
      .parse(req.body);
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
      const prompt = buildAnalysisPrompt({
        worry: body.worry,
        questions: body.questions,
        responses: body.responses,
      });
      const ai = await generateJSON<{
        recommendedChoice: 'A' | 'B';
        choiceALabel?: string;
        choiceBLabel?: string;
        recommendedChoiceLabel?: string;
        otherChoiceLabel?: string;
        confidence: number;
        scoreA: number;
        scoreB: number;
        summary: string;
        actionSteps: string[];
        actionGuide?: {
          steps: Array<{ title: string; description: string }>;
          nextSuggestion?: string;
        };
        rationale?: {
          overview: string;
          keyReasons: Array<{
            name: string;
            detail: string;
            weight: number;
            relatedQuestions?: number[];
          }>;
        };
        personalityTraits: Array<{
          name: string;
          score: number;
          level: 'low' | 'medium' | 'high';
        }>;
        decisionFactors: Array<{
          name: string;
          score: number;
          level: 'low' | 'medium' | 'high';
        }>;
      }>(prompt);
      const conf = ai.confidence > 1 ? ai.confidence / 100 : ai.confidence;
      const isTrivial = (s?: string) => {
        if (!s) return true;
        const t = String(s).trim();
        if (!t) return true;
        if (t.length <= 2) return /^[AB]$/i.test(t);
        // remove non-letters (영문 외 제거) and check if only A/B remains (예: "선택 A", "A 선택")
        const letters = t.replace(/[^A-Za-z]/g, '').toUpperCase();
        return letters === 'A' || letters === 'B';
      };
      const inputALabel = body.labels?.choiceALabel
        ? String(body.labels.choiceALabel).trim()
        : '';
      const inputBLabel = body.labels?.choiceBLabel
        ? String(body.labels.choiceBLabel).trim()
        : '';

      let choiceALabel = '';
      let choiceBLabel = '';

      if (inputALabel && inputBLabel) {
        if (isTrivial(inputALabel) || isTrivial(inputBLabel)) {
          throw Object.assign(new Error('Invalid input labels'), {
            status: 400,
          });
        }
        choiceALabel = inputALabel;
        choiceBLabel = inputBLabel;
      } else {
        const rawALabel = String(ai.choiceALabel || '').trim();
        const rawBLabel = String(ai.choiceBLabel || '').trim();
        if (isTrivial(rawALabel) || isTrivial(rawBLabel)) {
          throw Object.assign(new Error('Invalid AI labels'), { status: 502 });
        }
        choiceALabel = rawALabel;
        choiceBLabel = rawBLabel;
      }

      const recommendedChoiceLabel =
        ai.recommendedChoice === 'A' ? choiceALabel : choiceBLabel;
      const otherChoiceLabel =
        ai.recommendedChoice === 'A' ? choiceBLabel : choiceALabel;

      const result = {
        recommendedChoice: ai.recommendedChoice,
        recommendedChoiceLabel,
        otherChoiceLabel,
        confidence: Number(conf.toFixed(2)),
        scoreA: ai.scoreA,
        scoreB: ai.scoreB,
        personalityTraits: ai.personalityTraits,
        decisionFactors: ai.decisionFactors,
        actionSteps: ai.actionSteps,
        actionGuide: ai.actionGuide,
        rationale: ai.rationale,
        summary: ai.summary,
      } as const;
      return res.status(200).json({ isSuccess: true, data: { result } });
    } catch (aiErr: any) {
      console.error('Analysis AI failed:', aiErr);
      throw Object.assign(new Error('Analysis generation failed'), {
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
