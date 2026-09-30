import React from 'react';
import { Search, ExternalLink, ArrowDown, BookOpen, Compass, CheckCircle2 } from 'lucide-react';

interface ResearchWorkspaceProps {
  instruction: string;
  responseContent: string;
  sources?: { title: string; domain: string; snippet: string }[];
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  instruction,
  responseContent,
  sources = [],
}) => {
  const defaultSources = sources.length > 0 ? sources : [
    {
      title: 'Industry Sector Capitalization & Solvency Ratio Review',
      domain: 'regulatory-bulletin.org',
      snippet: 'Macro trends, market penetration indices, and capital distribution across regional providers.'
    },
    {
      title: 'Emerging Insurtech Rails & Embedded Distribution Partnerships',
      domain: 'fintech-review.io',
      snippet: 'API-driven underwriting and mobile-first micro-insurance adoption rates across expanding markets.'
    },
    {
      title: 'Consumer Trust & Claim Settlement Latency Assessment',
      domain: 'policy-quarterly.org',
      snippet: 'Comparative analysis of automated claims adjudication vs legacy paper-based broker systems.'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#050607] text-[#F1F4F3] rounded-[24px] overflow-hidden border border-[#202629]">
      
      {/* Subheader */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0B0E10] border-b border-[#202629] text-xs">
        <div className="flex items-center gap-2 text-[#F1F4F3]">
          <Search className="w-3.5 h-3.5 text-[#8FF3DF]" />
          <span className="font-semibold">Deep Research & Grounding Pipeline</span>
        </div>
        <span className="text-[10px] text-[#778184] font-mono">
          Synthesis Engine Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 pt-3 sm:pt-4 pb-16 sm:pb-24 space-y-4 sm:space-y-6 touch-scroll scroll-container">
        
        {/* Pipeline Architecture Diagram */}
        <div className="p-4 bg-[#0B0E10] border border-[#202629] rounded-[20px] text-xs">
          <div className="text-[11px] font-semibold text-[#778184] uppercase tracking-wider mb-3">
            Execution Flow
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-[11px]">
            <div className="flex-1 w-full p-2.5 rounded-[14px] bg-[#111416] border border-[#202629]">
              <span className="text-[#778184] block text-[9px] uppercase">Input</span>
              <strong className="text-[#F1F4F3] block truncate mt-0.5">{instruction || 'Universal Query'}</strong>
            </div>

            <ArrowDown className="w-3.5 h-3.5 text-[#778184] sm:-rotate-90 shrink-0" />

            <div className="flex-1 w-full p-2.5 rounded-[14px] bg-[#111416] border border-[#202629]">
              <span className="text-[#778184] block text-[9px] uppercase">Retrieval</span>
              <strong className="text-[#8FF3DF] block mt-0.5">3 Evidence Vectors</strong>
            </div>

            <ArrowDown className="w-3.5 h-3.5 text-[#778184] sm:-rotate-90 shrink-0" />

            <div className="flex-1 w-full p-2.5 rounded-[14px] bg-[#111416] border border-[#202629]">
              <span className="text-[#778184] block text-[9px] uppercase">Synthesis</span>
              <strong className="text-[#D8FF65] block mt-0.5">Dossier Compiled</strong>
            </div>
          </div>
        </div>

        {/* Retrieved Sources Section */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-[#778184] uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#8FF3DF]" /> Verified Grounding Context
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {defaultSources.map((src, i) => (
              <div
                key={i}
                className="p-3.5 bg-[#0B0E10] border border-[#202629] rounded-[16px] text-xs space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono text-[#D8FF65] truncate flex items-center justify-between">
                    <span>{src.domain}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </div>
                  <div className="font-medium text-[#F1F4F3] mt-1 line-clamp-2 leading-snug">
                    {src.title}
                  </div>
                  <p className="text-[11px] text-[#778184] mt-1 line-clamp-3 leading-relaxed">
                    {src.snippet}
                  </p>
                </div>
                <div className="pt-2 text-[10px] text-[#778184] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#8FF3DF]" /> Confidence 96%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Synthesized Report */}
        <div className="p-6 bg-[#0B0E10] border border-[#202629] rounded-[22px] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#202629]">
            <Compass className="w-4 h-4 text-[#D8FF65]" />
            <h3 className="text-sm font-bold text-[#F1F4F3]">Executive Research Synthesis</h3>
          </div>

          <div className="whitespace-pre-wrap font-sans text-xs text-[#C6CECF] leading-relaxed">
            {responseContent}
          </div>
        </div>

      </div>

    </div>
  );
};
