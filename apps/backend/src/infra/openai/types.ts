export interface GenerateParams {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  stream?: boolean;
}

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type JsonObjectFormat = {
  type: 'json_object';
};

export type ResponsesTextFormat = {
  format?: JsonObjectFormat;
};

export interface ResponsesCreateParams {
  model: string;
  input: string;
  text?: ResponsesTextFormat;
  temperature?: number;
}

export interface ResponseOutputTextContent {
  text?: { value?: string };
}

export interface ResponseOutputItem {
  content?: ResponseOutputTextContent[];
}

export interface ResponsesResponse {
  output_text?: string;
  output?: ResponseOutputItem[];
}

export interface ChatCompletionsCreateParams {
  model: string;
  messages: ChatMessage[];
  response_format?: JsonObjectFormat;
  temperature?: number;
}

export interface ChatCompletionChoice {
  message?: { content?: string };
}

export interface ChatCompletionsResponse {
  choices?: ChatCompletionChoice[];
}

export type ErrorLike = {
  message?: string;
  status?: number;
  statusCode?: number;
  code?: string | number;
};
