import { GoogleGenAI } from "@google/genai";
import { ChatMessage, ModelOption, CoachRequest } from "../types";
import { COACH_CORE_PROMPT, FOCUS_AREA_PROMPTS } from "../constants";

// Using process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Internal model constants
// Mapping user friendly names to actual model IDs based on system guidelines
const MODEL_MAPPING = {
  [ModelOption.FLASH]: 'gemini-3-flash-preview',
  [ModelOption.PRO_THINKING]: 'gemini-3-pro-preview',
};

// Fallback model for coaching
const COACH_MODEL = 'gemini-3-flash-preview'; 

export const sendMessageToGemini = async (
  selectedModel: ModelOption,
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const modelId = MODEL_MAPPING[selectedModel];
    
    // Configure thinking budget if it's the Pro (Thinking) model
    // Thinking Config is only available for Gemini 3 and 2.5 series models.
    const config: any = {};
    if (selectedModel === ModelOption.PRO_THINKING) {
      config.thinkingConfig = { thinkingBudget: 2048 }; 
    }

    // Create chat session with history
    const chat = ai.chats.create({
      model: modelId,
      config: config,
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "No response generated.";

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
  }
};

export const getCoachingFeedback = async (request: CoachRequest): Promise<string> => {
  try {
    const focusPrompt = FOCUS_AREA_PROMPTS[request.focusArea];
    
    let systemInstruction = `${COACH_CORE_PROMPT}\n\n**FOCUS AREA: ${request.focusArea}**\n${focusPrompt}`;

    let userPrompt = `PLATFORM BEING EVALUATED: ${request.platform}`;
    
    if (request.modelType) {
      userPrompt += `\nMODEL TYPE: ${request.modelType}`;
    }

    userPrompt += `\n\nSTUDENT CONVERSATION/PROMPT:\n${request.conversationText}`;

    if (request.customQuestion) {
      userPrompt += `\n\nSTUDENT QUESTION: ${request.customQuestion}`;
    }

    const response = await ai.models.generateContent({
      model: COACH_MODEL,
      config: {
        systemInstruction: systemInstruction,
      },
      contents: userPrompt,
    });

    return response.text || "No feedback generated.";

  } catch (error) {
    console.error("Error getting coaching feedback:", error);
    return `Error generating feedback: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
  }
};