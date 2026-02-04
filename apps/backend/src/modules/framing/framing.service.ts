import { requestAIJsonParse } from '@infra/openai/requestAIJsonParse';
import {
  buildAxisPrompt,
  buildFramingPrompt,
  type AxisResult,
} from '@modules/framing/framing.prompts';
import {
  AxisAIResponseSchema,
  FramingAIResponseSchema,
} from '@modules/framing/framing.schemas';
import { ErrorCode } from '@myorg/shared';
import { isTrivialChoiceLabel } from '@shared/aiUtils';
import { createContextId } from '@shared/contextMap';
import { createHttpErrorFromCode, isHttpErrorLike } from '@shared/errors';

const DEFAULT_CTA = '이렇게 설정해서 10개 질문으로 분석해볼까요?';

async function generateAxis(worry: { content: string; category?: string }) {
  const axisPrompt = buildAxisPrompt({ worry });
  const axis = await requestAIJsonParse(axisPrompt, AxisAIResponseSchema);
  const axisA = String(axis.axisA || '').trim();
  const axisB = String(axis.axisB || '').trim();
  const rationaleA = String(axis.rationaleA || '').trim();
  const rationaleB = String(axis.rationaleB || '').trim();
  if (!axisA || !axisB || !rationaleA || !rationaleB || axisA === axisB) {
    throw createHttpErrorFromCode(502, ErrorCode.INVALID_AI_LABELS);
  }

  const result: AxisResult = {
    axisName: `${axisA} VS ${axisB}`,
    axisA,
    axisB,
    rationaleA,
    rationaleB,
    keywords: axis.keywords,
  };

  return result;
}

export async function generateFraming(
  worry: {
    content: string;
    category?: string;
  },
  anonId: string
) {
  try {
    const axis = await generateAxis(worry);
    const prompt = buildFramingPrompt({ worry, axis });
    const ai = await requestAIJsonParse(prompt, FramingAIResponseSchema);
    if (
      isTrivialChoiceLabel(ai.choiceALabel) ||
      isTrivialChoiceLabel(ai.choiceBLabel)
    ) {
      throw createHttpErrorFromCode(502, ErrorCode.INVALID_AI_LABELS);
    }
    const aHint = String(ai.aHint || '').trim();
    const bHint = String(ai.bHint || '').trim();
    if (!aHint || !bHint) {
      throw createHttpErrorFromCode(502, ErrorCode.INVALID_AI_HINTS);
    }
    const framing = {
      choiceALabel: ai.choiceALabel,
      choiceBLabel: ai.choiceBLabel,
      aHint,
      bHint,
      axis: {
        axisName: axis.axisName,
        axisA: axis.axisA,
        axisB: axis.axisB,
        rationaleA: axis.rationaleA,
        rationaleB: axis.rationaleB,
        keywords: axis.keywords,
      },
      cta: DEFAULT_CTA,
    } as const;
    const contextId = createContextId(anonId);
    return { framing, contextId } as const;
  } catch (aiErr: unknown) {
    if (isHttpErrorLike(aiErr)) {
      throw aiErr;
    }
    console.error('Framing AI failed:', aiErr);
    throw createHttpErrorFromCode(502, ErrorCode.FRAMING_AI_FAILED);
  }
}
