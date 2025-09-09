import { Router } from "express";
import { z } from "zod";
import { generateJSON } from "../lib/openai";
import { buildFramingPrompt } from "../lib/prompts";

const WorrySchema = z.object({
  content: z.string().min(1),
  category: z.string().optional(),
});

function deriveChoiceLabels(category?: string) {
  const byCat: Record<string, { labelA: string; labelB: string }> = {
    career: { labelA: "현 직장 안정성 추구", labelB: "새 기회로 도전" },
    relationship: { labelA: "현재 관계 개선", labelB: "새로운 결단/변화" },
    business: { labelA: "리스크 최소화·보수적", labelB: "작게 시작해 실험" },
    money: { labelA: "지출 최적화·안정", labelB: "수익 확대·투자" },
    study: { labelA: "기초 다지기·안정 학습", labelB: "도전 과제·성장" },
    life: { labelA: "현 생활 유지·균형", labelB: "새로운 변화·확장" },
    family: { labelA: "가족 고려·안정", labelB: "자기 결정·전환" },
  };
  return (
    byCat[(category || "").toLowerCase()] || {
      labelA: "현재 방식 유지하기",
      labelB: "적극적인 변화 추구하기",
    }
  );
}

export const framingRouter = Router();

const FramingSchema = z.object({
  summary: z.string(),
  choiceALabel: z.string(),
  choiceBLabel: z.string(),
  aHint: z.string(),
  bHint: z.string(),
  cta: z.string(),
});

framingRouter.post("/framing", async (req, res) => {
  try {
    const body = z
      .object({ worry: WorrySchema, sessionId: z.string().optional() })
      .parse(req.body);
    try {
      const prompt = buildFramingPrompt({ worry: body.worry });
      const ai = await generateJSON<z.infer<typeof FramingSchema>>(prompt);
      // normalize trivial labels like "A", "B"
      const trivial = (s?: string) => {
        if (!s) return true;
        const t = String(s).trim();
        if (!t) return true;
        if (t.length <= 2) return /^[AB]$/i.test(t);
        const letters = t.replace(/[^A-Za-z]/g, "").toUpperCase();
        return letters === "A" || letters === "B";
      };
      const fallbackLabels = deriveChoiceLabels(body.worry.category);
      const choiceALabel = trivial(ai.choiceALabel)
        ? fallbackLabels.labelA
        : ai.choiceALabel;
      const choiceBLabel = trivial(ai.choiceBLabel)
        ? fallbackLabels.labelB
        : ai.choiceBLabel;
      const summary =
        ai.summary && ai.summary.includes("vs")
          ? ai.summary
          : `이 상황을 구조화해보면 "${choiceALabel} vs ${choiceBLabel}"로 정리할 수 있어요.`;
      const framing = {
        summary,
        choiceALabel,
        choiceBLabel,
        aHint: ai.aHint || "무리 없는 범위에서 현 상태 최적화",
        bHint: ai.bHint || "작게 시작하는 변화 시도",
        cta: ai.cta || "이렇게 설정해서 10개 질문으로 같이 분석해볼까요?",
      } as const;
      return res.status(200).json({ source: "ai", framing });
    } catch (_aiErr) {
      const labels = deriveChoiceLabels(body.worry.category);
      const framing = {
        summary: `이 상황을 구조화해보면 "${labels.labelA} vs ${labels.labelB}"로 정리할 수 있어요.`,
        choiceALabel: labels.labelA,
        choiceBLabel: labels.labelB,
        aHint: "무리 없는 범위에서 현 상태 최적화",
        bHint: "작게 시작하는 변화 시도",
        cta: "이렇게 설정해서 10개 질문으로 같이 분석해볼까요?",
      } as const;
      return res.status(200).json({ source: "fallback", framing });
    }
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 400;
    return res
      .status(status)
      .json({ error: err?.message || "Invalid request" });
  }
});
