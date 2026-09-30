import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, Bug, Sparkles, RefreshCw } from 'lucide-react';

interface CodeWorkspaceProps {
  instruction: string;
  responseContent: string;
  onFollowup: (actionText: string) => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  instruction,
  responseContent,
  onFollowup,
}) => {
  const [copied, setCopied] = useState(false);

  const codeBlockMatch = responseContent.match(/```(?:typescript|tsx|javascript|js)?([\s\S]*?)```/);
  const codeText = codeBlockMatch ? codeBlockMatch[1].trim() : responseContent;
  const lines = codeText.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#050607] text-[#F1F4F3] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#202629]">
      
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0B0E10] border-b border-[#202629] text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#8FF3DF] shrink-0" />
          <span className="font-semibold text-[#F1F4F3] truncate">Code Kernel</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111416] border border-[#202629] text-[#778184] font-mono hidden xs:inline">
            TypeScript 5.x
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onFollowup('Refactor this code to minimize allocations and add comprehensive error handling.')}
            className="flex items-center gap-1 px-2.5 py-1 min-h-[34px] rounded-full border border-[#202629] text-[#778184] hover:text-[#F1F4F3] hover:border-[#353F44] transition-all text-[11px] active:scale-95 touch-manipulation whitespace-nowrap"
          >
            <RefreshCw className="w-3 h-3 text-[#D8FF65]" /> Refactor
          </button>
          <button
            onClick={() => onFollowup('Generate unit tests with Vitest for this module covering all failure boundaries.')}
            className="flex items-center gap-1 px-2.5 py-1 min-h-[34px] rounded-full border border-[#202629] text-[#778184] hover:text-[#F1F4F3] hover:border-[#353F44] transition-all text-[11px] active:scale-95 touch-manipulation whitespace-nowrap"
          >
            <Bug className="w-3 h-3 text-[#8FF3DF]" /> Tests
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 min-h-[34px] rounded-full bg-[#111416] border border-[#202629] text-[#F1F4F3] hover:border-[#353F44] transition-all text-[11px] active:scale-95 touch-manipulation whitespace-nowrap"
          >
            {copied ? <Check className="w-3 h-3 text-[#D8FF65]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 pt-3 sm:pt-4 pb-16 sm:pb-24 space-y-4 touch-scroll scroll-container">
        
        {/* Full markdown explanation text if present */}
        <div className="bg-[#0B0E10] border border-[#202629] rounded-[18px] sm:rounded-[20px] p-3.5 sm:p-4 text-xs text-[#778184] leading-relaxed">
          <div className="text-[#F1F4F3] font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D8FF65]" /> Architectural Evaluation
          </div>
          <div className="whitespace-pre-wrap font-sans text-xs text-[#9CA4A5] leading-relaxed">
            {responseContent.split('```')[0].trim() || 'Code synthesized successfully under zero-leakage invariant constraints.'}
          </div>
        </div>

        {/* Code Canvas with Line Numbers */}
        <div className="bg-[#07090A] border border-[#202629] rounded-[18px] sm:rounded-[20px] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#0B0E10] border-b border-[#202629] text-[10px] sm:text-[11px] text-[#778184]">
            <span className="font-mono">kernel_module.ts</span>
            <span className="font-mono">{lines.length} lines</span>
          </div>

          <div className="p-3 sm:p-4 font-mono text-xs overflow-x-auto touch-scroll text-[#E1E7E6] leading-6 flex">
            {/* Line numbers column */}
            <div className="select-none pr-3 sm:pr-4 text-right text-[#353F44] border-r border-[#202629] shrink-0 text-[11px]">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code content */}
            <div className="pl-3 sm:pl-4 min-w-0 flex-1 whitespace-pre text-[11px] sm:text-xs">
              {lines.map((line, idx) => (
                <div key={idx} className="hover:bg-[#111416]/50 rounded px-1">
                  {line || ' '}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
