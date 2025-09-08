import OpenAI from "openai";
import { env } from "../config/env";

function getClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw Object.assign(new Error("OPENAI_API_KEY is not set"), {
      status: 500,
    });
  }
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
  });
}

export interface GenerateParams {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: string;
  temperature?: number;
  stream?: boolean;
}

export async function generateText(params: GenerateParams): Promise<string> {
  const client = getClient();
  const model = params.model || env.OPENAI_MODEL;
  const temperature = params.temperature ?? 0.5;

  // Helper: collapse chat messages into a single prompt for Responses API
  const toPrompt = () =>
    params.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

  // Prefer Responses API for broader key compatibility (e.g., sk-proj keys)
  try {
    const resp = await client.responses.create({
      model,
      input: toPrompt(),
      temperature,
    } as any);
    // SDK v5 provides helper: output_text
    // Fallback: extract from content parts if needed
    const text =
      (resp as any).output_text ??
      ((resp as any).output
        ?.map((p: any) => p?.content?.map((c: any) => c?.text?.value).join(""))
        .join("") ||
        "");
    return text || "";
  } catch (_ignored) {
    // Fallback to legacy chat.completions for older keys
    const resp = await client.chat.completions.create({
      model,
      messages: params.messages,
      temperature,
    });
    return resp.choices[0]?.message?.content || "";
  }
}

export async function* streamText(
  params: GenerateParams
): AsyncIterable<string> {
  const client = getClient();
  const stream = await client.chat.completions.create({
    model: params.model || env.OPENAI_MODEL,
    messages: params.messages,
    temperature: params.temperature ?? 0.5,
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

// Generate JSON via Responses API with JSON response_format when available
export async function generateJSON<T>(
  input: string,
  model?: string,
  temperature?: number
): Promise<T> {
  const client = getClient();
  const useModel = model || env.OPENAI_MODEL;
  try {
    const requestParams = {
      model: useModel,
      input,
    };

    const resp: any = await (client as any).responses.create(requestParams);
    console.log("Responses API raw response:", {
      model: useModel,
      hasOutputText: !!resp.output_text,
      outputText: resp.output_text,
      fullResponse: JSON.stringify(resp, null, 2),
    });
    const txt: string = resp.output_text ?? "";
    if (!txt.trim()) {
      throw new Error("Empty response from Responses API");
    }
    return JSON.parse(txt) as T;
  } catch (jsonErr: any) {
    console.error("Responses API JSON failed:", {
      model: useModel,
      error: jsonErr?.message || String(jsonErr),
      status: jsonErr?.status,
      code: jsonErr?.code,
    });
    // Fallback: plain text then JSON.parse
    const txt = await generateText({
      messages: [{ role: "user", content: input }],
      model: useModel,
    });
    return JSON.parse(txt) as T;
  }
}
