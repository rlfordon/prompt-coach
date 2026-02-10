export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum ModelOption {
  FLASH = 'Gemini 2.5 Flash',
  PRO_THINKING = 'Gemini 2.5 Pro (Thinking)',
}

export enum Platform {
  GEMINI = 'Gemini',
  CHATGPT = 'ChatGPT',
  CLAUDE = 'Claude',
  WESTLAW_COUNSEL = 'Westlaw CoCounsel',
  LEXIS_PROTEGE = 'Lexis Protege',
  NOTEBOOK_LM = 'NotebookLM',
  OTHER = 'Other',
}

export enum ModelType {
  INSTANT = 'Instant/Fast',
  REASONING = 'Reasoning/Thinking',
  NOT_SURE = 'Not sure',
}

export enum FocusArea {
  CONTEXT_ENGINEERING = 'Context Engineering',
  MODEL_SELECTION = 'Model Selection',
  HALLUCINATION_RISK = 'Hallucination Risk',
  REASONING_MODEL_FIT = 'Reasoning Model Fit',
  ITERATION_STRATEGY = 'Iteration Strategy',
  PLATFORM_FIT = 'Platform Fit',
  FULL_REVIEW = 'Full Review',
  ASK_MY_OWN_QUESTION = 'Ask My Own Question',
}

export interface CoachRequest {
  platform: string;
  modelType?: string;
  focusArea: string;
  conversationText: string;
  customQuestion?: string;
}