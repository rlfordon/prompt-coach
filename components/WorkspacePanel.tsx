import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ModelOption } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface WorkspacePanelProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  selectedModel: ModelOption;
  setSelectedModel: (model: ModelOption) => void;
}

const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ 
  chatHistory, 
  setChatHistory,
  selectedModel,
  setSelectedModel
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

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: inputText };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Pass the current history (excluding the new message we just added to state, 
      // but the service function expects the history *before* the new message usually if we use chat.sendMessage
      // Actually, my service implementation takes the history array. 
      // Ideally, the service takes the *previous* history and the *new* message.
      const responseText = await sendMessageToGemini(selectedModel, chatHistory, userMessage.text);
      
      const botMessage: ChatMessage = { role: 'model', text: responseText };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error." };
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

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] border-r border-gray-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Your Workspace</h2>
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelOption)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-scarlet focus:border-scarlet sm:text-sm rounded-md shadow-sm"
          >
            <option value={ModelOption.FLASH}>{ModelOption.FLASH}</option>
            <option value={ModelOption.PRO_THINKING}>{ModelOption.PRO_THINKING}</option>
          </select>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Select a model and start practicing your prompting.</p>
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
                    a: ({node, ...props}) => (
                      <a 
                        {...props} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`underline ${msg.role === 'user' ? 'text-white font-bold' : 'text-blue-600 hover:text-blue-800'}`}
                      />
                    )
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
              <span className="animate-pulse">Gemini is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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