import type {
  GenerateParams,
  ResponsesCreateParams,
  ResponsesResponse,
} from './types';
import { getClient, getModel, getTemperature } from './client';
import { extractTextFromResponses, toPrompt } from './utils';

export async function generateText(params: GenerateParams): Promise<string> {
  const client = getClient();
  const model = getModel(params.model);
  const temperature = getTemperature(params.temperature);

  try {
    const resp = (await client.responses.create({
      model,
      input: toPrompt(params.messages),
      temperature,
    } as ResponsesCreateParams)) as ResponsesResponse;
    const text = extractTextFromResponses(resp);
    return text || '';
  } catch (_ignored) {
    const resp = await client.chat.completions.create({
      model,
      messages: params.messages,
      temperature,
    });
    return resp.choices[0]?.message?.content || '';
  }
}
