// Base URL of the shared Cloudflare Worker that holds the OpenRouter key.
// Source: https://github.com/rlfordon/TokenExplorer/tree/main/worker
export const PROXY_URL = 'https://rlfordon-ai-proxy.REPLACE_ME.workers.dev';

// OpenRouter model IDs. Must match CHAT_MODELS in the worker, or the worker rejects the request.
export const MODELS: Record<string, Record<string, string>> = {
  gemini: { flash: 'google/gemini-3.8-flash', thinking: 'google/gemini-3.1-pro-preview' },
  openai: { fast: 'openai/gpt-5.4-mini', reasoning: 'openai/gpt-5.5' },
  anthropic: { fast: 'anthropic/claude-haiku-4.5', reasoning: 'anthropic/claude-sonnet-5' },
};

export const COACH_MODELS: Record<string, string> = {
  gemini: 'google/gemini-3.8-flash',
  openai: 'openai/gpt-5.4-mini',
  anthropic: 'anthropic/claude-sonnet-5',
};
