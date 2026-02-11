import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Platform, FocusArea, ChatMessage, CoachRequest, ModelType } from '../types';
import { getCoachingFeedback } from '../services/aiService';

interface CoachPanelProps {
  chatHistory: ChatMessage[];
  workspaceProvider: string;
  workspaceModelTier: string;
  isPasteMode: boolean;
  setIsPasteMode: (mode: boolean) => void;
  pastedContent: string;
  availableProviders: string[];
}

const CoachPanel: React.FC<CoachPanelProps> = ({
  chatHistory,
  workspaceProvider,
  workspaceModelTier,
  isPasteMode,
  setIsPasteMode,
  pastedContent,
  availableProviders,
}) => {
  const [platform, setPlatform] = useState<Platform>(Platform.GEMINI);
  const [modelType, setModelType] = useState<ModelType>(ModelType.INSTANT);
  const [focusArea, setFocusArea] = useState<FocusArea | ''>('');
  const [customQuestion, setCustomQuestion] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPasteMode) return;

    if (workspaceProvider === 'gemini') {
      setPlatform(Platform.GEMINI);
    } else if (workspaceProvider === 'openai') {
      setPlatform(Platform.CHATGPT);
    } else if (workspaceProvider === 'anthropic') {
      setPlatform(Platform.CLAUDE);
    }

    if (workspaceModelTier === 'thinking' || workspaceModelTier === 'reasoning') {
      setModelType(ModelType.REASONING);
    } else {
      setModelType(ModelType.INSTANT);
    }
  }, [workspaceProvider, workspaceModelTier, isPasteMode]);

  const shouldShowModelType = (p: Platform) => {
    return ![Platform.WESTLAW_COUNSEL, Platform.LEXIS_PROTEGE, Platform.NOTEBOOK_LM].includes(p);
  };

  const formatChatHistory = (history: ChatMessage[]) => {
    return history.map((msg) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`).join('\n\n');
  };

  const getConversationText = () => {
    if (isPasteMode) return pastedContent;
    return formatChatHistory(chatHistory);
  };

  const hasContent = isPasteMode ? pastedContent.trim().length > 0 : chatHistory.length > 0;

  const coachProvider = availableProviders.includes('openai')
    ? 'openai'
    : availableProviders.includes('anthropic')
      ? 'anthropic'
      : availableProviders.includes('gemini')
        ? 'gemini'
        : 'gemini';

  const handleReviewConversation = async () => {
    if (!focusArea) {
      setError('Please select a feedback focus area.');
      return;
    }
    if (focusArea === FocusArea.ASK_MY_OWN_QUESTION && !customQuestion.trim()) {
      setError('Please enter your question.');
      return;
    }
    const conversationText = getConversationText();
    if (!conversationText.trim()) {
      setError(
        isPasteMode
          ? 'Please paste the conversation in the left panel.'
          : 'Your workspace conversation is empty. Start chatting or switch to Paste mode.'
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    setFeedback(null);

    const request: CoachRequest = {
      platform,
      modelType: shouldShowModelType(platform) ? modelType : undefined,
      focusArea,
      conversationText,
      customQuestion: focusArea === FocusArea.ASK_MY_OWN_QUESTION ? customQuestion : undefined,
    };

    const response = await getCoachingFeedback(request, coachProvider);
    setFeedback(response);
    setIsLoading(false);
  };

  const togglePasteMode = () => {
    setIsPasteMode(!isPasteMode);
    setError(null);
  };

  const handleExport = () => {
    const conversationText = getConversationText();
    const exportContent = [
      'PROMPT COACH SESSION EXPORT',
      `Date: ${new Date().toLocaleString()}`,
      '',
      '--- CONFIGURATION ---',
      `Platform: ${platform}`,
      shouldShowModelType(platform) ? `Model Type: ${modelType}` : '',
      `Focus Area: ${focusArea}`,
      focusArea === FocusArea.ASK_MY_OWN_QUESTION ? `Custom Question: ${customQuestion}` : '',
      '',
      '--- CONVERSATION ---',
      conversationText || '(No conversation content)',
      '',
      '--- COACH FEEDBACK ---',
      feedback || '(No feedback generated)',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prompt_Coach_Export_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-scarlet">Prompt Coach</h2>
          <p className="text-sm text-gray-500">21st Century Lawyering - OSU Moritz College of Law</p>
        </div>
        <div className="flex space-x-2">
          {hasContent && (
            <button
              onClick={handleExport}
              title="Export Session"
              className="p-2 text-gray-500 hover:text-scarlet hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 border-b border-gray-200 bg-gray-50 space-y-4">
        {isPasteMode && !feedback && !isLoading && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Which platform are you using?</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-scarlet focus:border-scarlet sm:text-sm rounded-md shadow-sm"
              >
                {Object.values(Platform).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {shouldShowModelType(platform) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model type:</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input id="instant" name="modelType" type="radio" checked={modelType === ModelType.INSTANT} onChange={() => setModelType(ModelType.INSTANT)} className="focus:ring-scarlet h-4 w-4 text-scarlet border-gray-300" />
                    <label htmlFor="instant" className="ml-3 block text-sm text-gray-700">Instant/Fast (e.g., Gemini Flash, GPT-4o, Claude Haiku/Sonnet)</label>
                  </div>
                  <div className="flex items-center">
                    <input id="reasoning" name="modelType" type="radio" checked={modelType === ModelType.REASONING} onChange={() => setModelType(ModelType.REASONING)} className="focus:ring-scarlet h-4 w-4 text-scarlet border-gray-300" />
                    <label htmlFor="reasoning" className="ml-3 block text-sm text-gray-700">Reasoning/Thinking (e.g., Gemini Pro Thinking, o1/o3, Claude Opus)</label>
                  </div>
                  <div className="flex items-center">
                    <input id="not_sure" name="modelType" type="radio" checked={modelType === ModelType.NOT_SURE} onChange={() => setModelType(ModelType.NOT_SURE)} className="focus:ring-scarlet h-4 w-4 text-scarlet border-gray-300" />
                    <label htmlFor="not_sure" className="ml-3 block text-sm text-gray-700">Not sure</label>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What feedback do you want? <span className="text-red-500">*</span>
          </label>
          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value as FocusArea)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-scarlet focus:border-scarlet sm:text-sm rounded-md shadow-sm"
          >
            <option value="" disabled>Select a focus area...</option>
            {Object.values(FocusArea).map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {focusArea === FocusArea.ASK_MY_OWN_QUESTION && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What's your question? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-scarlet focus:border-scarlet sm:text-sm rounded-md shadow-sm border"
              placeholder="e.g., How can I make this prompt more specific?"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReviewConversation}
            disabled={isLoading}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-scarlet hover:bg-[#a00b29] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scarlet disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : isPasteMode ? 'Review Pasted Conversation' : 'Review My Conversation'}
          </button>
          <button
            onClick={togglePasteMode}
            disabled={isLoading}
            className={`flex-1 inline-flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scarlet ${
              isPasteMode ? 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isPasteMode ? 'Back to Workspace' : 'Paste From Another Tool'}
          </button>
        </div>

        {error && <div className="text-red-600 text-sm mt-2 font-medium">{error}</div>}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {feedback ? (
          <div className="prose prose-sm max-w-none text-gray-800 [&>*:first-child]:mt-0">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Coach Feedback</h3>
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800" />
                ),
              }}
            >
              {feedback}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-center">Select options above and ask for feedback<br />to see coaching insights here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachPanel;
