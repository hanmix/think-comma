import { Router } from "express";
import { z } from "zod";
import { generateJSON } from "../lib/openai";
import { buildQuestionsPrompt } from "../lib/prompts";

const WorrySchema = z.object({
  content: z.string().min(1),
  category: z.string().optional(),
});

function buildQuestions(category?: string, content?: string) {
  const common = [
    {
      text: "이 문제에 대해 생각하는 시간이?",
      choices: [
        { id: "A", content: "하루에 30분 미만이다" },
        { id: "B", content: "하루에 1시간 이상이다" },
      ],
    },
    {
      text: "비슷한 상황을 겪은 경험이 있다면?",
      choices: [
        { id: "A", content: "신중하게 결정해서 좋은 결과" },
        { id: "B", content: "빨리 결정했어야 했다고 후회" },
      ],
    },
    {
      text: "이 결정의 영향을 받는 사람들을 생각하면?",
      choices: [
        { id: "A", content: "안정성" },
        { id: "B", content: "나의 행복" },
      ],
    },
    {
      text: "6개월 후의 나는?",
      choices: [
        { id: "A", content: "현재 선택 유지" },
        { id: "B", content: "변화된 모습" },
      ],
    },
    {
      text: "가장 중요한 가치는?",
      choices: [
        { id: "A", content: "안정과 확실성" },
        { id: "B", content: "성장과 도전" },
      ],
    },
    {
      text: "직감적으로 끌리는 선택은?",
      choices: [
        { id: "A", content: "현상 유지 개선" },
        { id: "B", content: "완전한 새로운 시작" },
      ],
    },
  ];
  const byCat: Record<string, any[]> = {
    career: [
      {
        text: "현재 상황에 대한 스트레스 수준은?",
        choices: [
          { id: "A", content: "관리 가능" },
          { id: "B", content: "상당히 부담" },
        ],
      },
      {
        text: "장기적 목표를 생각했을 때?",
        choices: [
          { id: "A", content: "현 경로가 안전" },
          { id: "B", content: "변화 필요" },
        ],
      },
    ],
    relationship: [
      {
        text: "이 상황이 지속된다면?",
        choices: [
          { id: "A", content: "시간이 해결" },
          { id: "B", content: "적극적 행동 필요" },
        ],
      },
    ],
    business: [
      {
        text: "실패 상상 시?",
        choices: [
          { id: "A", content: "감당 어렵다" },
          { id: "B", content: "배움의 기회" },
        ],
      },
    ],
  };
  const context: any[] = [];
  const c = (content || "").toLowerCase();
  if (/나이|늦|마지막/.test(c))
    context.push({
      text: "나이나 시기에 대한 우려가?",
      choices: [
        { id: "A", content: "결정적 장애" },
        { id: "B", content: "극복 가능" },
      ],
    });
  if (/돈|경제|재정/.test(c))
    context.push({
      text: "경제적 부담에 대해?",
      choices: [
        { id: "A", content: "감당 어렵다" },
        { id: "B", content: "해결 가능" },
      ],
    });
  if (/가족|부모|배우자/.test(c))
    context.push({
      text: "가족의 반응은?",
      choices: [
        { id: "A", content: "이해 어렵다" },
        { id: "B", content: "결국 지지" },
      ],
    });
  const merged = [...(byCat[category || ""] || []), ...context, ...common];
  return merged
    .slice(0, 10)
    .map((q, i) => ({ id: i + 1, text: q.text, choices: q.choices }));
}

export const questionsRouter = Router();

const AIQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string(),
        choices: z
          .array(
            z.object({
              id: z.enum(["A", "B"]),
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
    choices: Array<{ id: "A" | "B"; content: string }>;
  }> = [];
  for (const it of list) {
    const text = it?.text || it?.question || it?.title || "";
    let choices = it?.choices || it?.options || it?.answers || [];
    if (!Array.isArray(choices)) choices = [];
    const a = choices[0];
    const b = choices[1];
    const toContent = (c: any) =>
      typeof c === "string" ? c : c?.content || c?.text || "";
    const A = toContent(a);
    const B = toContent(b);
    if (text && A && B)
      out.push({
        text,
        choices: [
          { id: "A", content: A },
          { id: "B", content: B },
        ],
      });
    if (out.length >= 10) break;
  }
  return out;
}

questionsRouter.post("/generate-questions", async (req, res) => {
  try {
    const body = z.object({ worry: WorrySchema }).parse(req.body);
    try {
      const prompt = buildQuestionsPrompt({ worry: body.worry });
      const ai = await generateJSON<{
        questions: Array<{
          text: string;
          choices: Array<{ id: "A" | "B"; content: string }>;
        }>;
      }>(prompt);
      try {
        const parsed = AIQuestionsSchema.parse(ai);
        const list = parsed.questions
          .slice(0, 10)
          .map((q, i) => ({ id: i + 1, text: q.text, choices: q.choices }));
        return res.status(200).json({ source: "ai", questions: list });
      } catch {
        const list = normalizeAI(ai).map((q, i) => ({
          id: i + 1,
          text: q.text,
          choices: q.choices,
        }));
        if (list.length)
          return res
            .status(200)
            .json({ source: "ai-normalized", questions: list });
        throw new Error("AI parse failed");
      }
    } catch (_aiErr) {
      const questions = buildQuestions(body.worry.category, body.worry.content);
      return res.status(200).json({ source: "fallback", questions });
    }
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 400;
    return res
      .status(status)
      .json({ error: err?.message || "Invalid request" });
  }
});
