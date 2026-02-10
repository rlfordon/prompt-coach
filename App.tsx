import React, { useState } from 'react';
import WorkspacePanel from './components/WorkspacePanel';
import CoachPanel from './components/CoachPanel';
import PastePanel from './components/PastePanel';
import { ChatMessage, ModelOption } from './types';

function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(ModelOption.FLASH);
  
  // State for Paste Mode
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pastedContent, setPastedContent] = useState('');

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-white overflow-hidden">
      {/* Left Panel: Workspace OR Paste Panel */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
        {isPasteMode ? (
          <PastePanel 
            content={pastedContent} 
            setContent={setPastedContent} 
          />
        ) : (
          <WorkspacePanel 
            chatHistory={chatHistory} 
            setChatHistory={setChatHistory}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        )}
      </div>

      {/* Divider */}
      <div className="h-1 w-full md:w-1 md:h-full bg-gray-300 shrink-0"></div>

      {/* Right Panel: Prompt Coach */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
        <CoachPanel 
          chatHistory={chatHistory} 
          workspaceModel={selectedModel}
          isPasteMode={isPasteMode}
          setIsPasteMode={setIsPasteMode}
          pastedContent={pastedContent}
        />
      </div>
    </div>
  );
}

export default App;