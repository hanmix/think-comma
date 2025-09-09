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

// Generate JSON via Responses API with JSON response_format when available
export async function generateJSON<T>(
  input: string,
  model?: string
): Promise<T> {
  const client = getClient();
  const useModel = model || env.OPENAI_MODEL;

  // Instruction hardening to discourage fenced blocks
  const hardenedPrompt = `${input}\n\nIMPORTANT: Return ONLY a JSON object. Do not wrap the JSON in code fences or add any extra text.`;

  // Prefer Responses API with JSON mode when available
  try {
    const requestParams: any = {
      model: useModel,
      input: hardenedPrompt,
      // Enable JSON mode (older mode) which forces valid JSON
      text: { format: { type: "json_object" } },
    };

    const resp: any = await (client as any).responses.create(requestParams);
    const txt: string = resp.output_text ?? "";
    if (!txt.trim()) throw new Error("Empty response from Responses API");

    const jsonStr = extractJson(txt);
    return JSON.parse(jsonStr) as T;
  } catch (jsonErr: any) {
    console.error("Responses API JSON failed:", {
      model: useModel,
      error: jsonErr?.message || String(jsonErr),
      status: jsonErr?.status,
      code: jsonErr?.code,
    });

    // Fallback #1: Chat Completions with JSON mode
    try {
      const chatResp = await client.chat.completions.create({
        model: useModel,
        messages: [
          {
            role: "system",
            content: "You only ever respond with a single valid JSON object.",
          },
          { role: "user", content: input },
        ],
        response_format: { type: "json_object" },
        // temperature omitted to reduce variability for JSON structure
      } as any);

      const content = chatResp.choices?.[0]?.message?.content || "";
      const jsonStr = extractJson(content);
      return JSON.parse(jsonStr) as T;
    } catch (chatErr: any) {
      console.error("Chat Completions JSON failed:", {
        model: useModel,
        error: chatErr?.message || String(chatErr),
        status: chatErr?.status,
        code: chatErr?.code,
      });

      // Fallback #2: Plain text generation then best-effort extraction
      const txt = await generateText({
        messages: [{ role: "user", content: hardenedPrompt }],
        model: useModel,
        // keep temperature default from generateText
      });
      const jsonStr = extractJson(txt);
      return JSON.parse(jsonStr) as T;
    }
  }
}

// Helper: Extract JSON string from possibly noisy/fenced output
function extractJson(raw: string): string {
  const text = raw.trim();
  // 1) Prefer fenced code blocks ```json ... ``` or ``` ... ```
  const fence =
    text.match(/```json[\s\S]*?\n([\s\S]*?)```/i) ||
    text.match(/```\s*\n([\s\S]*?)```/i);
  const body = fence ? fence[1] : text;

  // 2) Slice from the first JSON-looking char ({ or [)
  const firstObj = body.indexOf("{");
  const firstArr = body.indexOf("[");
  const start =
    [firstObj, firstArr].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? -1;
  if (start < 0) throw new Error("No JSON start token found");

  const candidate = body.slice(start).trim();

  // 3) Try full parse; if it fails, truncate to the last closing token and try again
  try {
    JSON.parse(candidate);
    return candidate;
  } catch {}

  const endObj = candidate.lastIndexOf("}");
  const endArr = candidate.lastIndexOf("]");
  const end = Math.max(endObj, endArr);
  if (end >= 0) {
    const sliced = candidate.slice(0, end + 1);
    JSON.parse(sliced); // throws if invalid
    return sliced;
  }

  throw new Error("Unable to extract valid JSON");
}
