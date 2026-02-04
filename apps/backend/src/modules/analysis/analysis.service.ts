import { requestAIJsonParse } from '@infra/openai/requestAIJsonParse';
import { buildAnalysisPrompt } from '@modules/analysis/analysis.prompts';
import { AnalysisAIResponseSchema } from '@modules/analysis/analysis.schemas';
import { ErrorCode } from '@myorg/shared';
import { isTrivialChoiceLabel, normalizeConfidence } from '@shared/aiUtils';
import { createHttpErrorFromCode, isHttpErrorLike } from '@shared/errors';

type AnalysisInput = {
  worry: { content: string; category?: string };
  questions: Array<{
    id: number;
    text: string;
    choices: Array<{ id: 'A' | 'B'; content: string }>;
  }>;
  responses: Array<{ questionId: number; answer: 'A' | 'B' }>;
  labels?: { choiceALabel?: string; choiceBLabel?: string };
  axis?: {
    axisA: string;
    axisB: string;
    rationaleA: string;
    rationaleB: string;
    keywords?: string[];
  };
};

const normalizeLabel = (label?: string): string =>
  label ? String(label).trim() : '';

const resolveInputLabels = (labels?: {
  choiceALabel?: string;
  choiceBLabel?: string;
}): { inputALabel: string; inputBLabel: string } => ({
  inputALabel: normalizeLabel(labels?.choiceALabel),
  inputBLabel: normalizeLabel(labels?.choiceBLabel),
});

const resolveChoiceLabels = (
  inputALabel: string,
  inputBLabel: string,
  ai: { choiceALabel?: string; choiceBLabel?: string }
): { choiceALabel: string; choiceBLabel: string } => {
  if (inputALabel && inputBLabel) {
    return { choiceALabel: inputALabel, choiceBLabel: inputBLabel };
  }

  const rawALabel = normalizeLabel(ai.choiceALabel);
  const rawBLabel = normalizeLabel(ai.choiceBLabel);
  if (isTrivialChoiceLabel(rawALabel) || isTrivialChoiceLabel(rawBLabel)) {
    throw createHttpErrorFromCode(502, ErrorCode.INVALID_AI_LABELS);
  }

  return { choiceALabel: rawALabel, choiceBLabel: rawBLabel };
};

const weightForQuestionId = (questionId: number): number => {
  if (questionId <= 3) return 1;
  if (questionId <= 7) return 2;
  return 3;
};

const computeScoresFromResponses = (
  responses: Array<{ questionId: number; answer: 'A' | 'B' }>
): { scoreA: number; scoreB: number } => {
  let WA = 0;
  let WB = 0;
  for (const response of responses) {
    const weight = weightForQuestionId(response.questionId);
    if (response.answer === 'A') {
      WA += weight;
    } else {
      WB += weight;
    }
  }
  const total = WA + WB;
  const scoreA = Math.round((WA / total) * 100);
  const scoreB = 100 - scoreA;
  return { scoreA, scoreB };
};

const clampScore = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));

const resolveAxisAlignment = (axisAlignment?: {
  scoreA?: number;
  scoreB?: number;
}): { scoreA: number; scoreB: number } | null => {
  if (!axisAlignment) return null;
  const scoreA = Number(axisAlignment.scoreA);
  const scoreB = Number(axisAlignment.scoreB);
  if (!Number.isFinite(scoreA) || !Number.isFinite(scoreB)) return null;
  return { scoreA: clampScore(scoreA), scoreB: clampScore(scoreB) };
};

export async function generateAnalysisResult(input: AnalysisInput) {
  const { inputALabel, inputBLabel } = resolveInputLabels(input.labels);

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
      axis: input.axis,
    });
    const ai = await requestAIJsonParse(prompt, AnalysisAIResponseSchema);
    const { choiceALabel, choiceBLabel } = resolveChoiceLabels(
      inputALabel,
      inputBLabel,
      ai
    );
    if (
      !Array.isArray(ai.personalityTraits) ||
      ai.personalityTraits.length === 0 ||
      !Array.isArray(ai.decisionFactors) ||
      ai.decisionFactors.length === 0
    ) {
      throw createHttpErrorFromCode(502, ErrorCode.ANALYSIS_AI_FAILED);
    }

    const responseScores = computeScoresFromResponses(input.responses);
    const axisAlignment = resolveAxisAlignment(ai.axisAlignment);
    const responseWeight = 0.7;
    const axisWeight = 0.3;
    const blendedScores = axisAlignment
      ? {
          scoreA: clampScore(
            responseScores.scoreA * responseWeight +
              axisAlignment.scoreA * axisWeight
          ),
        }
      : responseScores;
    const scoreA = blendedScores.scoreA;
    const scoreB = 100 - scoreA;
    const recommendedChoice: 'A' | 'B' = scoreA >= scoreB ? 'A' : 'B';
    const recommendedChoiceLabel =
      recommendedChoice === 'A' ? choiceALabel : choiceBLabel;
    const otherChoiceLabel =
      recommendedChoice === 'A' ? choiceBLabel : choiceALabel;
    const confidence = normalizeConfidence(Math.max(scoreA, scoreB));

    return {
      recommendedChoice,
      recommendedChoiceLabel,
      otherChoiceLabel,
      confidence,
      scoreA,
      scoreB,
      axisAlignment,
      personalityTraits: ai.personalityTraits,
      decisionFactors: ai.decisionFactors,
      actionSteps: ai.actionSteps,
      actionGuide: ai.actionGuide,
      rationale: ai.rationale,
      guidance: ai.guidance,
    } as const;
  } catch (aiErr: unknown) {
    if (isHttpErrorLike(aiErr)) {
      throw aiErr;
    }
    console.error('Analysis AI failed:', aiErr);
    throw createHttpErrorFromCode(502, ErrorCode.ANALYSIS_AI_FAILED);
  }
}
