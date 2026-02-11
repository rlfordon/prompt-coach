import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/aiService';

const PROVIDER_OPTIONS = [
  {
    id: 'gemini',
    label: 'Gemini',
    models: [
      { tier: 'flash', label: 'Flash (Fast)' },
      { tier: 'thinking', label: 'Pro (Thinking)' },
    ],
  },
  {
    id: 'openai',
    label: 'ChatGPT',
    models: [
      { tier: 'fast', label: 'GPT-4o Mini (Fast)' },
      { tier: 'reasoning', label: 'o3-mini (Reasoning)' },
    ],
  },
  {
    id: 'anthropic',
    label: 'Claude',
    models: [
      { tier: 'fast', label: 'Claude Haiku (Fast)' },
      { tier: 'reasoning', label: 'Claude Sonnet (Reasoning)' },
    ],
  },
];

interface WorkspacePanelProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  selectedProvider: string;
  setSelectedProvider: (p: string) => void;
  selectedModelTier: string;
  setSelectedModelTier: (t: string) => void;
  availableProviders: string[];
}

const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  chatHistory,
  setChatHistory,
  selectedProvider,
  setSelectedProvider,
  selectedModelTier,
  setSelectedModelTier,
  availableProviders,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const currentProviderConfig = PROVIDER_OPTIONS.find((p) => p.id === selectedProvider) || PROVIDER_OPTIONS[0];

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const newProvider = PROVIDER_OPTIONS.find((p) => p.id === providerId);
    if (newProvider) {
      setSelectedModelTier(newProvider.models[0].tier);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: inputText };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage(
        selectedProvider,
        selectedModelTier,
        chatHistory,
        userMessage.text
      );
      const botMessage: ChatMessage = { role: 'model', text: responseText };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error.' };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const providerLabel = currentProviderConfig.label;

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] border-r border-gray-300">
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-800">Your Workspace</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedProvider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="block pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-scarlet focus:border-scarlet rounded-md shadow-sm"
          >
            {PROVIDER_OPTIONS.filter(
              (p) => availableProviders.length === 0 || availableProviders.includes(p.id)
            ).map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={selectedModelTier}
            onChange={(e) => setSelectedModelTier(e.target.value)}
            className="block pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-scarlet focus:border-scarlet rounded-md shadow-sm"
          >
            {currentProviderConfig.models.map((m) => (
              <option key={m.tier} value={m.tier}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Select a provider and model, then start practicing your prompting.</p>
          </div>
        )}
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 shadow-sm overflow-hidden ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <div
                className={`prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${
                  msg.role === 'user' ? 'prose-invert' : ''
                }`}
              >
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline ${msg.role === 'user' ? 'text-white font-bold' : 'text-blue-600 hover:text-blue-800'}`}
                      />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 border border-gray-200 rounded-lg px-4 py-3 rounded-bl-none shadow-sm">
              <span className="animate-pulse">{providerLabel} is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your prompt here..."
            disabled={isLoading}
            className="flex-1 focus:ring-scarlet focus:border-scarlet block w-full rounded-md border-gray-300 shadow-sm p-3 border"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isLoading || !inputText.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-scarlet hover:bg-[#a00b29] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scarlet'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePanel;
