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

function deriveChoiceLabels(category?: string, _content?: string) {
  const defaults = {
    labelA: "현재 방식 유지하기",
    labelB: "적극적인 변화 추구하기",
  } as const;
  const byCat: Record<string, { labelA: string; labelB: string }> = {
    career: { labelA: "현 직장 안정성 추구", labelB: "새 기회로 도전" },
    relationship: { labelA: "현재 관계 개선", labelB: "새로운 결단/변화" },
    business: { labelA: "리스크 최소화·보수적", labelB: "작게 시작해 실험" },
    money: { labelA: "지출 최적화·안정", labelB: "수익 확대·투자" },
    study: { labelA: "기초 다지기·안정 학습", labelB: "도전 과제·성장" },
    life: { labelA: "현 생활 유지·균형", labelB: "새로운 변화·확장" },
    family: { labelA: "가족 고려·안정", labelB: "자기 결정·전환" },
  };
  return byCat[(category || "").toLowerCase()] || defaults;
}

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
  const labels = deriveChoiceLabels(worry.category, worry.content);
  return {
    recommendedChoice,
    recommendedChoiceLabel:
      recommendedChoice === "A" ? labels.labelA : labels.labelB,
    otherChoiceLabel: recommendedChoice === "A" ? labels.labelB : labels.labelA,
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
      const labels = deriveChoiceLabels(
        body.worry.category,
        body.worry.content
      );

      // Normalize labels to avoid trivial "A"/"B" outputs from AI
      const isTrivial = (s?: string) => {
        if (!s) return true;
        const t = String(s).trim();
        if (!t) return true;
        if (t.length <= 2) return /^[AB]$/i.test(t);
        // remove non-letters (영문 외 제거) and check if only A/B remains (예: "선택 A", "A 선택")
        const letters = t.replace(/[^A-Za-z]/g, "").toUpperCase();
        return letters === "A" || letters === "B";
      };

      const rawALabel = ai.choiceALabel;
      const rawBLabel = ai.choiceBLabel;
      const choiceALabel = isTrivial(rawALabel)
        ? labels.labelA
        : String(rawALabel);
      const choiceBLabel = isTrivial(rawBLabel)
        ? labels.labelB
        : String(rawBLabel);

      const rawRec = ai.recommendedChoiceLabel;
      const rawOther = ai.otherChoiceLabel;
      const recommendedChoiceLabel = isTrivial(rawRec)
        ? ai.recommendedChoice === "A"
          ? choiceALabel
          : choiceBLabel
        : String(rawRec);
      const otherChoiceLabel = isTrivial(rawOther)
        ? ai.recommendedChoice === "A"
          ? choiceBLabel
          : choiceALabel
        : String(rawOther);

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
