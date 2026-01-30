import { z } from 'zod';

export const AnalysisAIResponseSchema = z.object({
  recommendedChoice: z.enum(['A', 'B']),
  choiceALabel: z.string().optional(),
  choiceBLabel: z.string().optional(),
  recommendedChoiceLabel: z.string().optional(),
  otherChoiceLabel: z.string().optional(),
  confidence: z.number(),
  scoreA: z.number(),
  scoreB: z.number(),
  summary: z.string(),
  actionSteps: z.array(z.string()),
  actionGuide: z
    .object({
      steps: z.array(z.object({ title: z.string(), description: z.string() })),
      nextSuggestion: z.string().optional(),
    })
    .optional(),
  rationale: z
    .object({
      overview: z.string(),
      keyReasons: z.array(
        z.object({
          name: z.string(),
          detail: z.string(),
          weight: z.number(),
          relatedQuestions: z.array(z.number()).optional(),
        })
      ),
    })
    .optional(),
  personalityTraits: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      level: z.enum(['low', 'medium', 'high']),
    })
  ),
  decisionFactors: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      level: z.enum(['low', 'medium', 'high']),
    })
  ),
});
