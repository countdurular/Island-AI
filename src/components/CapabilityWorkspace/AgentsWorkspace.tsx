import React, { useState } from 'react';
import { Bot, Search, Hammer, Code, Zap, Play } from 'lucide-react';

interface AgentsWorkspaceProps {
  instruction: string;
  responseContent: string;
  onDelegateToAgent: (agentName: string, prompt: string) => void;
}

export const AgentsWorkspace: React.FC<AgentsWorkspaceProps> = ({
  instruction,
  responseContent,
  onDelegateToAgent,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('Builder Agent');

  const agents = [
    {
      name: 'Research Agent',
      icon: Search,
      color: 'text-[#8FF3DF]',
      role: 'Evidence Gathering & Fact Grounding',
      responsibility: 'Crawls factual domains, cross-references citations, and synthesizes competitive intelligence vectors into structured findings.',
      modelTarget: 'Claude 3.5 Sonnet / Perplexity',
      status: 'Ready',
    },
    {
      name: 'Builder Agent',
      icon: Hammer,
      color: 'text-[#D8FF65]',
      role: 'System Topology & Architecture Scaffolding',
      responsibility: 'Generates UI/UX wireframes, layout component trees, database schema definitions, and production deployment scripts.',
      modelTarget: 'Gemini 3.8 Flash / Claude',
      status: 'Active',
    },
    {
      name: 'Code Agent',
      icon: Code,
      color: 'text-[#F1F4F3]',
      role: 'Implementation & Refactoring Specialist',
      responsibility: 'Produces production-grade TypeScript code, runs invariant checks, eliminates race conditions, and drafts unit test suites.',
      modelTarget: 'DeepSeek R1 / GPT-4o',
      status: 'Ready',
    },
    {
      name: 'Automation Agent',
      icon: Zap,
      color: 'text-[#D8FF65]',
      role: 'Workflow Execution & Event Handlers',
      responsibility: 'Compiles natural language into Trigger-Condition-Action graphs, manages webhook dispatchers, and supervises health checks.',
      modelTarget: 'GPT-4o Workflow Engine',
      status: 'Standby',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050607] text-[#F1F4F3] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#202629]">
      
      {/* Subheader */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0B0E10] border-b border-[#202629] text-xs">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#D8FF65] shrink-0" />
          <span className="font-semibold truncate">Worker Swarm</span>
        </div>
        <span className="text-[10px] text-[#778184] font-mono">
          4 Workers
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 pt-3 sm:pt-4 pb-16 sm:pb-24 space-y-4 sm:space-y-6 touch-scroll scroll-container">
        
        {/* Notice of Architecture */}
        <div className="p-3 sm:p-3.5 bg-[#0B0E10] border border-[#202629] rounded-[18px] text-xs text-[#778184] flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] sm:text-xs">
            Agents operate as specialized persona contexts within the Island wrapper.
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111416] border border-[#202629] text-[#8FF3DF] font-mono shrink-0">
            Simulation Ready
          </span>
        </div>

        {/* 4 Agent Cards Grid - 1 Col Mobile, 2 Col Tablet/Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent === agent.name;
            return (
              <div
                key={agent.name}
                onClick={() => setSelectedAgent(agent.name)}
                className={`p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] border cursor-pointer transition-all flex flex-col justify-between active:scale-98 touch-manipulation ${
                  isSelected
                    ? 'bg-[#0E1214] border-[#D8FF65]/40 shadow-lg ring-1 ring-[#D8FF65]/20'
                    : 'bg-[#0B0E10] border-[#202629] hover:border-[#353F44]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-[12px] bg-[#111416] border border-[#202629] shrink-0">
                        <Icon className={`w-4 h-4 ${agent.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-xs text-[#F1F4F3] truncate">{agent.name}</div>
                        <div className="text-[10px] text-[#778184] truncate">{agent.role}</div>
                      </div>
                    </div>

                    <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-[#111416] border border-[#202629] text-[#778184] font-mono shrink-0 ml-1">
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#778184] leading-relaxed mt-2 line-clamp-3">
                    {agent.responsibility}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#202629]/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#778184] truncate">{agent.modelTarget.split(' ')[0]}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelegateToAgent(agent.name, instruction);
                    }}
                    className="flex items-center gap-1 text-[#D8FF65] hover:underline p-1 min-h-[32px] shrink-0 active:scale-95 touch-manipulation"
                  >
                    <Play className="w-2.5 h-2.5" /> Delegate
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Output Breakdown */}
        <div className="p-4 sm:p-5 bg-[#0B0E10] border border-[#202629] rounded-[20px] sm:rounded-[22px] space-y-3">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-[#202629] flex-wrap gap-2">
            <span className="font-bold text-[#F1F4F3] flex items-center gap-1.5 truncate">
              <Bot className="w-3.5 h-3.5 text-[#D8FF65] shrink-0" /> <span className="truncate">Matrix: {selectedAgent}</span>
            </span>
            <span className="text-[10px] text-[#778184] font-mono">Status: Ready</span>
          </div>

          <div className="whitespace-pre-wrap font-sans text-xs text-[#9CA4A5] leading-relaxed">
            {responseContent}
          </div>
        </div>

      </div>

    </div>
  );
};
