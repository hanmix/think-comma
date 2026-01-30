import { ErrorCode } from '@myorg/shared';
import { jsonParser } from '@infra/openai/jsonParser';
import { isTrivialChoiceLabel } from '@shared/aiUtils';
import { createContextId } from '@shared/contextMap';
import { createHttpErrorFromCode, isHttpErrorLike } from '@shared/errors';
import { buildFramingPrompt } from '@modules/framing/framing.prompts';
import { FramingAIResponseSchema } from '@modules/framing/framing.schemas';

export async function generateFraming(
  worry: {
    content: string;
    category?: string;
  },
  anonId: string
) {
  try {
    const prompt = buildFramingPrompt({ worry });
    const ai = await jsonParser(prompt, FramingAIResponseSchema);
    if (
      isTrivialChoiceLabel(ai.choiceALabel) ||
      isTrivialChoiceLabel(ai.choiceBLabel)
    ) {
      throw createHttpErrorFromCode(502, ErrorCode.INVALID_AI_LABELS);
    }
    const summary = String(ai.summary || '').trim();
    if (!summary) {
      throw createHttpErrorFromCode(502, ErrorCode.INVALID_AI_SUMMARY);
    }
    const aHint = String(ai.aHint || '').trim();
    const bHint = String(ai.bHint || '').trim();
    const cta = String(ai.cta || '').trim();
    if (!aHint || !bHint || !cta) {
      throw createHttpErrorFromCode(502, ErrorCode.INVALID_AI_HINTS);
    }
    const framing = {
      summary,
      choiceALabel: ai.choiceALabel,
      choiceBLabel: ai.choiceBLabel,
      aHint,
      bHint,
      cta,
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
