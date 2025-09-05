import { Router } from "express";
import { z } from "zod";
import { generateJSON } from "../lib/openai";
import { buildAnalysisPrompt } from "../lib/prompts";

const ChoiceSchema = z.object({ id: z.enum(["A", "B"]), content: z.string() });
const QuestionSchema = z.object({
  id: z.number(),
  text: z.string(),
  choices: z.array(ChoiceSchema),
});
const ResponseSchema = z.object({
  questionId: z.number(),
  answer: z.enum(["A", "B"]),
});
const WorrySchema = z.object({
  content: z.string().min(1),
  category: z.string().optional(),
});

function analyze(
  worry: z.infer<typeof WorrySchema>,
  responses: z.infer<typeof ResponseSchema>[]
) {
  const scoreA = responses.filter((r) => r.answer === "A").length;
  const scoreB = responses.filter((r) => r.answer === "B").length;
  const recommendedChoice = scoreA >= scoreB ? "A" : "B";
  const traits =
    recommendedChoice === "A" ? ["안정지향", "신중함"] : ["성장지향", "도전적"];
  const factors =
    recommendedChoice === "A"
      ? ["리스크 회피", "책임감"]
      : ["기회 선호", "성취욕"];
  const actions =
    recommendedChoice === "A"
      ? [
          "리스크 낮추기 위한 대비책 3가지 정리",
          "1주일간 현상 유지의 장단점 기록",
        ]
      : ["작게 시작할 실험 1개 선정", "2주간 실행 계획 수립"];
  const summary = `당신의 고민: ${worry.content}\n추천 선택: ${recommendedChoice}`;
  return {
    recommendedChoice,
    recommendedChoiceLabel: recommendedChoice === "A" ? "A 선택" : "B 선택",
    otherChoiceLabel: recommendedChoice === "A" ? "B 선택" : "A 선택",
    confidence: Number(
      (Math.max(scoreA, scoreB) / Math.max(1, responses.length)).toFixed(2)
    ),
    scoreA,
    scoreB,
    personalityTraits: traits.map(
      (t, i) =>
        ({
          name: t,
          score: 0.6 + i * 0.1,
          level: 0.6 + i * 0.1 > 0.7 ? "high" : "medium",
        } as const)
    ),
    decisionFactors: factors.map(
      (t, i) =>
        ({
          name: t,
          score: 0.5 + i * 0.1,
          level: 0.5 + i * 0.1 > 0.7 ? "high" : "medium",
        } as const)
    ),
    actionSteps: actions,
    summary,
  };
}

export const analysisRouter = Router();

analysisRouter.post("/analyze", async (req, res) => {
  try {
    const body = z
      .object({
        worry: WorrySchema,
        questions: z.array(QuestionSchema),
        responses: z.array(ResponseSchema),
      })
      .parse(req.body);
    try {
      const prompt = buildAnalysisPrompt({
        worry: body.worry,
        questions: body.questions,
        responses: body.responses,
      });
      const ai = await generateJSON<{
        recommendedChoice: "A" | "B";
        choiceALabel?: string;
        choiceBLabel?: string;
        recommendedChoiceLabel?: string;
        otherChoiceLabel?: string;
        confidence: number;
        scoreA: number;
        scoreB: number;
        summary: string;
        actionSteps: string[];
        personalityTraits: Array<{
          name: string;
          score: number;
          level: "low" | "medium" | "high";
        }>;
        decisionFactors: Array<{
          name: string;
          score: number;
          level: "low" | "medium" | "high";
        }>;
      }>(prompt);
      const conf = ai.confidence > 1 ? ai.confidence / 100 : ai.confidence;
      const choiceALabel = ai.choiceALabel || 'A 선택';
      const choiceBLabel = ai.choiceBLabel || 'B 선택';
      const recommendedChoiceLabel = ai.recommendedChoiceLabel || (ai.recommendedChoice === 'A' ? choiceALabel : choiceBLabel);
      const otherChoiceLabel = ai.otherChoiceLabel || (ai.recommendedChoice === 'A' ? choiceBLabel : choiceALabel);

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
        summary: ai.summary,
      } as const;
      return res.status(200).json({ source: "ai", result });
    } catch (_aiErr) {
      const result = analyze(body.worry, body.responses);
      return res.status(200).json({ source: "fallback", result });
    }
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 400;
    return res
      .status(status)
      .json({ error: err?.message || "Invalid request" });
  }
});
