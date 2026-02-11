import React, { useState, useEffect } from 'react';
import WorkspacePanel from './components/WorkspacePanel';
import CoachPanel from './components/CoachPanel';
import PastePanel from './components/PastePanel';
import { ChatMessage } from './types';
import { getAvailableProviders } from './services/aiService';

function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModelTier, setSelectedModelTier] = useState('flash');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pastedContent, setPastedContent] = useState('');

  useEffect(() => {
    getAvailableProviders().then((providers) => {
      setAvailableProviders(providers);
      if (providers.length > 0 && !providers.includes(selectedProvider)) {
        setSelectedProvider(providers[0]);
        if (providers[0] === 'openai') setSelectedModelTier('fast');
        else if (providers[0] === 'anthropic') setSelectedModelTier('fast');
        else setSelectedModelTier('flash');
      }
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-white overflow-hidden">
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
        {isPasteMode ? (
          <PastePanel content={pastedContent} setContent={setPastedContent} />
        ) : (
          <WorkspacePanel
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            selectedModelTier={selectedModelTier}
            setSelectedModelTier={setSelectedModelTier}
            availableProviders={availableProviders}
          />
        )}
      </div>
      <div className="h-1 w-full md:w-1 md:h-full bg-gray-300 shrink-0"></div>
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
        <CoachPanel
          chatHistory={chatHistory}
          workspaceProvider={selectedProvider}
          workspaceModelTier={selectedModelTier}
          isPasteMode={isPasteMode}
          setIsPasteMode={setIsPasteMode}
          pastedContent={pastedContent}
          availableProviders={availableProviders}
        />
      </div>
    </div>
  );
}

export default App;
