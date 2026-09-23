import { ChatMessage, CoachRequest } from '../types';
import { COACH_CORE_PROMPT, FOCUS_AREA_PROMPTS } from '../constants';
import { PROXY_URL, MODELS, COACH_MODELS } from './config';

const PASSKEY_STORAGE_KEY = 'prompt-coach-passkey';

export const getStoredPasskey = (): string => {
  try {
    return localStorage.getItem(PASSKEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

const storePasskey = (passkey: string) => {
  try {
    localStorage.setItem(PASSKEY_STORAGE_KEY, passkey);
  } catch {
    // Storage unavailable (private window); the passkey lasts for this page load only.
  }
};

let sessionPasskey = getStoredPasskey();

export const isPasskeyRequired = async (): Promise<boolean> => {
  const res = await fetch(`${PROXY_URL}/health`);
  const data = await res.json();
  return Boolean(data.passkeyRequired);
};

// Returns true and remembers the passkey if the worker accepts it.
export const verifyPasskey = async (passkey: string): Promise<boolean> => {
  const res = await fetch(`${PROXY_URL}/verify`, {
    method: 'POST',
    headers: { 'X-Class-Passkey': passkey },
  });
  if (!res.ok) return false;
  sessionPasskey = passkey;
  storePasskey(passkey);
  return true;
};

async function callProxy(
  model: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  system?: string
): Promise<string> {
  const res = await fetch(`${PROXY_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Class-Passkey': sessionPasskey },
    body: JSON.stringify({ model, messages, system }),
  });
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status}). Please try again.`);
  }
  if (!res.ok) {
    const message = typeof data.error === 'string' ? data.error : data.error?.message;
    throw new Error(message || `Request failed (${res.status})`);
  }
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

export const getAvailableProviders = async (): Promise<string[]> => Object.keys(MODELS);

export const sendChatMessage = async (
  provider: string,
  modelTier: string,
  history: ChatMessage[],
  message: string
): Promise<string> => {
  try {
    const models = MODELS[provider];
    if (!models) throw new Error(`Unknown provider: ${provider}`);
    const model = models[modelTier] || Object.values(models)[0];
    const messages = history.map((msg) => ({
      role: msg.role === 'model' ? ('assistant' as const) : ('user' as const),
      content: msg.text,
    }));
    messages.push({ role: 'user', content: message });
    return await callProxy(model, messages);
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const getCoachingFeedback = async (
  request: CoachRequest,
  provider: string
): Promise<string> => {
  try {
    const { focusArea, platform, modelType, conversationText, customQuestion } = request;
    const focusPrompt = FOCUS_AREA_PROMPTS[focusArea] || '';
    const system = `${COACH_CORE_PROMPT}\n\n**FOCUS AREA: ${focusArea}**\n${focusPrompt}`;

    let userPrompt = `PLATFORM BEING EVALUATED: ${platform || 'Unknown'}`;
    if (modelType) userPrompt += `\nMODEL TYPE: ${modelType}`;
    userPrompt += `\n\nSTUDENT CONVERSATION/PROMPT:\n${conversationText}`;
    if (customQuestion) userPrompt += `\n\nSTUDENT QUESTION: ${customQuestion}`;

    const model = COACH_MODELS[provider] || COACH_MODELS.gemini;
    return await callProxy(model, [{ role: 'user', content: userPrompt }], system);
  } catch (error) {
    return `Error generating feedback: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
