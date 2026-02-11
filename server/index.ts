import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { COACH_CORE_PROMPT, FOCUS_AREA_PROMPTS } from '../constants';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = 3001;

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenAI({ apiKey: key });
}

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  return new Anthropic({ apiKey: key });
}

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey: key });
}

const PROVIDER_MODELS: Record<string, Record<string, string>> = {
  gemini: {
    flash: 'gemini-2.0-flash',
    thinking: 'gemini-2.5-pro-preview-05-06',
  },
  openai: {
    fast: 'gpt-4o-mini',
    reasoning: 'o3-mini',
  },
  anthropic: {
    fast: 'claude-haiku-4-5-20250514',
    reasoning: 'claude-sonnet-4-20250514',
  },
};

// POST /api/chat - workspace chat
app.post('/api/chat', async (req, res) => {
  try {
    const { provider, modelTier, history, message } = req.body;

    if (!provider || !message) {
      return res.status(400).json({ error: 'provider and message are required' });
    }

    const models = PROVIDER_MODELS[provider];
    if (!models) {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    const modelId = models[modelTier] || models.fast;
    let responseText: string;

    if (provider === 'gemini') {
      const ai = getGeminiClient();
      const config: any = {};
      if (modelTier === 'thinking') {
        config.thinkingConfig = { thinkingBudget: 2048 };
      }
      const chat = ai.chats.create({
        model: modelId,
        config,
        history: (history || []).map((msg: any) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
      });
      const result = await chat.sendMessage({ message });
      responseText = result.text || 'No response generated.';
    } else if (provider === 'openai') {
      const client = getOpenAIClient();
      const messages = (history || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' as const : 'user' as const,
        content: msg.text,
      }));
      messages.push({ role: 'user' as const, content: message });

      const completion = await client.chat.completions.create({
        model: modelId,
        messages,
      });
      responseText = completion.choices[0]?.message?.content || 'No response generated.';
    } else if (provider === 'anthropic') {
      const client = getAnthropicClient();
      const messages = (history || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' as const : 'user' as const,
        content: msg.text,
      }));
      messages.push({ role: 'user' as const, content: message });

      const result = await client.messages.create({
        model: modelId,
        max_tokens: 4096,
        messages,
      });
      const textBlock = result.content.find((b: any) => b.type === 'text');
      responseText = textBlock ? (textBlock as any).text : 'No response generated.';
    } else {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error('Chat error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// POST /api/coach - coaching feedback
app.post('/api/coach', async (req, res) => {
  try {
    const { focusArea, platform, modelType, conversationText, customQuestion, provider } = req.body;

    if (!focusArea || !conversationText) {
      return res.status(400).json({ error: 'focusArea and conversationText are required' });
    }

    const focusPrompt = FOCUS_AREA_PROMPTS[focusArea] || '';
    const systemInstruction = `${COACH_CORE_PROMPT}\n\n**FOCUS AREA: ${focusArea}**\n${focusPrompt}`;

    let userPrompt = `PLATFORM BEING EVALUATED: ${platform || 'Unknown'}`;
    if (modelType) userPrompt += `\nMODEL TYPE: ${modelType}`;
    userPrompt += `\n\nSTUDENT CONVERSATION/PROMPT:\n${conversationText}`;
    if (customQuestion) userPrompt += `\n\nSTUDENT QUESTION: ${customQuestion}`;

    const coachProvider = provider || 'gemini';
    let responseText: string;

    if (coachProvider === 'gemini') {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        config: { systemInstruction },
        contents: userPrompt,
      });
      responseText = response.text || 'No feedback generated.';
    } else if (coachProvider === 'openai') {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt },
        ],
      });
      responseText = completion.choices[0]?.message?.content || 'No feedback generated.';
    } else if (coachProvider === 'anthropic') {
      const client = getAnthropicClient();
      const result = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemInstruction,
        messages: [{ role: 'user', content: userPrompt }],
      });
      const textBlock = result.content.find((b: any) => b.type === 'text');
      responseText = textBlock ? (textBlock as any).text : 'No feedback generated.';
    } else {
      return res.status(400).json({ error: `Unknown provider: ${coachProvider}` });
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error('Coach error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// GET /api/providers - which providers have API keys configured
app.get('/api/providers', (_req, res) => {
  const providers = [];
  if (process.env.GEMINI_API_KEY) providers.push('gemini');
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  res.json({ providers });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const listenPort = process.env.NODE_ENV === 'production' ? 5000 : PORT;
const listenHost = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

app.listen(listenPort, listenHost, () => {
  console.log(`Server running on http://${listenHost}:${listenPort}`);
});
