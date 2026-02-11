import { ChatMessage, CoachRequest } from '../types';

async function parseResponse(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.ok ? 'Server returned an invalid response. Please try again.' : `Server error (${res.status}). The backend may still be starting up - please wait a moment and try again.`);
  }
}

export const getAvailableProviders = async (): Promise<string[]> => {
  try {
    const res = await fetch('/api/providers');
    const data = await parseResponse(res);
    return data.providers || [];
  } catch {
    return [];
  }
};

export const sendChatMessage = async (
  provider: string,
  modelTier: string,
  history: ChatMessage[],
  message: string
): Promise<string> => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, modelTier, history, message }),
    });
    const data = await parseResponse(res);
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data.text;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const getCoachingFeedback = async (
  request: CoachRequest,
  provider: string
): Promise<string> => {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, provider }),
    });
    const data = await parseResponse(res);
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data.text;
  } catch (error) {
    return `Error generating feedback: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
