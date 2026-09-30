import React, { useState } from 'react';
import { FileSearch, FileText, Database, Layers } from 'lucide-react';
import { AttachedContext } from '../../types';

interface AnalyzeWorkspaceProps {
  instruction: string;
  responseContent: string;
  context: AttachedContext[];
}

export const AnalyzeWorkspace: React.FC<AnalyzeWorkspaceProps> = ({
  instruction,
  responseContent,
  context,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(context[0]?.id || '');
  const activeFile = context.find((c) => c.id === selectedFileId) || context[0];

  return (
    <div className="flex flex-col h-full bg-[#050607] text-[#F1F4F3] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#202629]">
      
      {/* Subheader */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0B0E10] border-b border-[#202629] text-xs">
        <div className="flex items-center gap-2">
          <FileSearch className="w-3.5 h-3.5 text-[#8FF3DF] shrink-0" />
          <span className="font-semibold truncate">Document Analyzer</span>
        </div>
        <span className="text-[10px] text-[#778184] font-mono shrink-0">
          {context.length} File{context.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 pt-3 sm:pt-4 pb-16 sm:pb-24 space-y-4 sm:space-y-6 touch-scroll scroll-container">
        
        {/* Token Metrics Grid - 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3 bg-[#0B0E10] border border-[#202629] rounded-[14px] sm:rounded-[16px]">
            <div className="text-[10px] text-[#778184] uppercase tracking-wider">Tokens</div>
            <div className="text-sm sm:text-base font-bold font-mono text-[#F1F4F3] mt-0.5 truncate">
              {context.reduce((acc, c) => acc + Math.round(c.content.length / 4), 1840).toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-[#0B0E10] border border-[#202629] rounded-[14px] sm:rounded-[16px]">
            <div className="text-[10px] text-[#778184] uppercase tracking-wider">Density</div>
            <div className="text-sm sm:text-base font-bold font-mono text-[#D8FF65] mt-0.5">88.4%</div>
          </div>
          <div className="p-3 bg-[#0B0E10] border border-[#202629] rounded-[14px] sm:rounded-[16px]">
            <div className="text-[10px] text-[#778184] uppercase tracking-wider">Coverage</div>
            <div className="text-sm sm:text-base font-bold font-mono text-[#8FF3DF] mt-0.5 truncate">100% Vector</div>
          </div>
          <div className="p-3 bg-[#0B0E10] border border-[#202629] rounded-[14px] sm:rounded-[16px]">
            <div className="text-[10px] text-[#778184] uppercase tracking-wider">Validation</div>
            <div className="text-sm sm:text-base font-bold font-mono text-[#F1F4F3] mt-0.5">UTF-8</div>
          </div>
        </div>

        {/* File Select Tabs if multiple files */}
        {context.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-scroll pb-1">
            {context.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-[12px] text-xs font-medium border transition-all shrink-0 active:scale-95 touch-manipulation ${
                  activeFile?.id === file.id
                    ? 'bg-[#171B1D] border-[#D8FF65]/40 text-[#F1F4F3]'
                    : 'bg-[#0B0E10] border-[#202629] text-[#778184] hover:text-[#F1F4F3]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#8FF3DF]" />
                <span className="truncate max-w-[120px]">{file.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected Document Content Preview */}
        {activeFile && (
          <div className="p-3.5 sm:p-4 bg-[#0B0E10] border border-[#202629] rounded-[18px] sm:rounded-[20px] space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202629]/60 flex-wrap gap-1">
              <span className="font-semibold text-[#F1F4F3] flex items-center gap-1.5 truncate">
                <Database className="w-3.5 h-3.5 text-[#D8FF65] shrink-0" /> <span className="truncate">Buffer: {activeFile.name}</span>
              </span>
              <span className="text-[10px] font-mono text-[#778184] shrink-0">{activeFile.size} · {activeFile.type}</span>
            </div>
            <pre className="font-mono text-[11px] sm:text-xs text-[#9CA4A5] whitespace-pre-wrap max-h-40 sm:max-h-48 overflow-y-auto touch-scroll leading-relaxed bg-[#050607] p-2.5 sm:p-3 rounded-[14px] border border-[#202629]">
              {activeFile.content}
            </pre>
          </div>
        )}

        {/* Synthesized Analysis Findings */}
        <div className="p-4 sm:p-6 bg-[#0B0E10] border border-[#202629] rounded-[20px] sm:rounded-[22px] space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#202629] text-xs font-bold text-[#F1F4F3]">
            <Layers className="w-4 h-4 text-[#8FF3DF] shrink-0" /> Structured Intelligence Findings
          </div>

          <div className="whitespace-pre-wrap font-sans text-xs text-[#C6CECF] leading-relaxed">
            {responseContent}
          </div>
        </div>

      </div>

    </div>
  );
};
