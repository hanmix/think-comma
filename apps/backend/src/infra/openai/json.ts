import { generateText } from './text';
import { getClient, getModel } from './client';
import { hardenJsonPrompt, logJsonError } from './utils';
import { extractJson } from './extract';
import type {
  ChatCompletionsCreateParams,
  ChatCompletionsResponse,
  ResponsesCreateParams,
  ResponsesResponse,
} from './types';

export async function generateJSON<T>(
  input: string,
  model?: string
): Promise<T> {
  const client = getClient();
  const useModel = getModel(model);

  const hardenedPrompt = hardenJsonPrompt(input);

  try {
    const requestParams: ResponsesCreateParams = {
      model: useModel,
      input: hardenedPrompt,
      text: { format: { type: 'json_object' } },
    };

    const resp = (await client.responses.create(
      requestParams
    )) as ResponsesResponse;
    const txt: string = resp.output_text ?? '';
    if (!txt.trim()) throw new Error('Empty response from Responses API');

    const jsonStr = extractJson(txt);
    return JSON.parse(jsonStr) as T;
  } catch (jsonErr: unknown) {
    logJsonError('Responses API', useModel, jsonErr);

    try {
      const chatResp = await client.chat.completions.create({
        model: useModel,
        messages: [
          {
            role: 'system',
            content: 'You only ever respond with a single valid JSON object.',
          },
          { role: 'user', content: input },
        ],
        response_format: { type: 'json_object' },
      } as ChatCompletionsCreateParams);

      const chat = chatResp as ChatCompletionsResponse;
      const content = chat.choices?.[0]?.message?.content || '';
      const jsonStr = extractJson(content);
      return JSON.parse(jsonStr) as T;
    } catch (chatErr: unknown) {
      logJsonError('Chat Completions', useModel, chatErr);

      const txt = await generateText({
        messages: [{ role: 'user', content: hardenedPrompt }],
        model: useModel,
      });
      const jsonStr = extractJson(txt);
      return JSON.parse(jsonStr) as T;
    }
  }
}
