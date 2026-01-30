import { ErrorCode } from '@myorg/shared';
import { jsonParser } from '@infra/openai/jsonParser';
import { isTrivialChoiceLabel, normalizeConfidence } from '@shared/aiUtils';
import { createHttpErrorFromCode, isHttpErrorLike } from '@shared/errors';
import { buildAnalysisPrompt } from '@modules/analysis/analysis.prompts';
import { AnalysisAIResponseSchema } from '@modules/analysis/analysis.schemas';

type AnalysisInput = {
  worry: { content: string; category?: string };
  questions: Array<{
    id: number;
    text: string;
    choices: Array<{ id: 'A' | 'B'; content: string }>;
  }>;
  responses: Array<{ questionId: number; answer: 'A' | 'B' }>;
  labels?: { choiceALabel?: string; choiceBLabel?: string };
};

export async function generateAnalysisResult(input: AnalysisInput) {
  const inputALabel = input.labels?.choiceALabel
    ? String(input.labels.choiceALabel).trim()
    : '';
  const inputBLabel = input.labels?.choiceBLabel
    ? String(input.labels.choiceBLabel).trim()
    : '';

  if (
    inputALabel &&
    inputBLabel &&
    (isTrivialChoiceLabel(inputALabel) || isTrivialChoiceLabel(inputBLabel))
  ) {
    throw createHttpErrorFromCode(400, ErrorCode.INVALID_LABELS);
  }

  try {
    const prompt = buildAnalysisPrompt({
      worry: input.worry,
      questions: input.questions,
      responses: input.responses,
    });
    const ai = await jsonParser(prompt, AnalysisAIResponseSchema);

    let choiceALabel = '';
    let choiceBLabel = '';

    if (inputALabel && inputBLabel) {
      choiceALabel = inputALabel;
      choiceBLabel = inputBLabel;
    } else {
      const rawALabel = String(ai.choiceALabel || '').trim();
      const rawBLabel = String(ai.choiceBLabel || '').trim();
      if (isTrivialChoiceLabel(rawALabel) || isTrivialChoiceLabel(rawBLabel)) {
        throw createHttpErrorFromCode(502, ErrorCode.INVALID_AI_LABELS);
      }
      choiceALabel = rawALabel;
      choiceBLabel = rawBLabel;
    }

    const recommendedChoiceLabel =
      ai.recommendedChoice === 'A' ? choiceALabel : choiceBLabel;
    const otherChoiceLabel =
      ai.recommendedChoice === 'A' ? choiceBLabel : choiceALabel;

    return {
      recommendedChoice: ai.recommendedChoice,
      recommendedChoiceLabel,
      otherChoiceLabel,
      confidence: normalizeConfidence(ai.confidence),
      scoreA: ai.scoreA,
      scoreB: ai.scoreB,
      personalityTraits: ai.personalityTraits,
      decisionFactors: ai.decisionFactors,
      actionSteps: ai.actionSteps,
      actionGuide: ai.actionGuide,
      rationale: ai.rationale,
      summary: ai.summary,
    } as const;
  } catch (aiErr: unknown) {
    if (isHttpErrorLike(aiErr)) {
      throw aiErr;
    }
    console.error('Analysis AI failed:', aiErr);
    throw createHttpErrorFromCode(502, ErrorCode.ANALYSIS_AI_FAILED);
  }
}
