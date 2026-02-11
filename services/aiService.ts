import { ChatMessage, CoachRequest } from '../types';

export const getAvailableProviders = async (): Promise<string[]> => {
  try {
    const res = await fetch('/api/providers');
    const data = await res.json();
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
    const data = await res.json();
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data.text;
  } catch (error) {
    return `Error generating feedback: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};
