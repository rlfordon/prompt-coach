import React from 'react';

interface PastePanelProps {
  content: string;
  setContent: (content: string) => void;
}

const PastePanel: React.FC<PastePanelProps> = ({ content, setContent }) => {
  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] border-r border-gray-300">
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Paste Conversation</h2>
        <span className="text-xs font-semibold text-scarlet bg-red-50 px-2 py-1 rounded-full uppercase tracking-wide border border-red-100">External Source Mode</span>
      </div>
      <div className="flex-1 p-4">
        <textarea
          className="w-full h-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-scarlet focus:border-scarlet resize-none text-sm font-mono bg-white"
          placeholder="Paste your full conversation here (e.g. from CoCounsel, Lexis+, ChatGPT)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PastePanel;