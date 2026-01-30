import type {
  ErrorLike,
  GenerateParams,
  ResponseOutputItem,
  ResponsesResponse,
} from './types';

export function toPrompt(messages: GenerateParams['messages']): string {
  return messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
}

export function hardenJsonPrompt(input: string): string {
  return `${input}\n\nIMPORTANT: Return ONLY a JSON object. Do not wrap the JSON in code fences or add any extra text.`;
}

export function extractTextFromResponses(resp: ResponsesResponse): string {
  return (
    resp.output_text ??
    (resp.output
      ?.map((p: ResponseOutputItem) =>
        p?.content?.map(c => c?.text?.value).join('')
      )
      .join('') ||
      '')
  );
}

export function logJsonError(scope: string, model: string, err: unknown) {
  const error = (
    err && typeof err === 'object' ? err : null
  ) as ErrorLike | null;
  console.error(`${scope} JSON failed:`, {
    model,
    error: error?.message || String(err),
    status: error?.status ?? error?.statusCode,
    code: error?.code,
  });
}
