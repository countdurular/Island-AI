import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, Send, Terminal, Layout, Search, Zap, Bot, Radio, FileSearch, HelpCircle } from 'lucide-react';
import { CapabilityId, Message, AttachedContext } from '../../types';
import { TypewriterText } from '../TypewriterText';
import { BuildWorkspace } from '../CapabilityWorkspace/BuildWorkspace';
import { CodeWorkspace } from '../CapabilityWorkspace/CodeWorkspace';
import { ResearchWorkspace } from '../CapabilityWorkspace/ResearchWorkspace';
import { AutomationWorkspace } from '../CapabilityWorkspace/AutomationWorkspace';
import { AgentsWorkspace } from '../CapabilityWorkspace/AgentsWorkspace';
import { VoiceWorkspace } from '../CapabilityWorkspace/VoiceWorkspace';
import { AnalyzeWorkspace } from '../CapabilityWorkspace/AnalyzeWorkspace';

interface AIWorkspaceProps {
  onBackToIsland: () => void;
  messages: Message[];
  capability: CapabilityId;
  model: string;
  isGenerating: boolean;
  attachedContext: AttachedContext[];
  onExecuteCommand: (prompt: string, overrideCap?: CapabilityId) => void;
}

export const AIWorkspace: React.FC<AIWorkspaceProps> = ({
  onBackToIsland,
  messages,
  capability,
  model,
  isGenerating,
  attachedContext,
  onExecuteCommand,
}) => {
  const [followupText, setFollowupText] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'flow' | 'specialized'>('specialized');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'flow' || capability === 'ask') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, viewMode, capability]);

  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user');

  const handleAction = (actionType: string) => {
    if (!latestAssistantMessage) return;
    const baseContent = latestAssistantMessage.content.slice(0, 300);

    switch (actionType) {
      case 'Explain':
        onExecuteCommand(`Explain the key reasoning, principles, and architectural trade-offs behind this: "${baseContent}..."`, 'ask');
        break;
      case 'Rewrite':
        onExecuteCommand(`Rewrite this to be more concise, dense, and production-hardened: "${baseContent}..."`, capability);
        break;
      case 'Build':
        onExecuteCommand(`Build a production component and landing page architecture based on: "${baseContent}..."`, 'build');
        break;
      case 'Research':
        onExecuteCommand(`Research industry precedents, regulatory benchmarks, and competitor approaches for: "${baseContent}..."`, 'research');
        break;
      case 'Code':
        onExecuteCommand(`Write clean, type-safe TypeScript code implementing: "${baseContent}..."`, 'code');
        break;
      case 'Export': {
        const fullContent = latestAssistantMessage.content;
        navigator.clipboard.writeText(fullContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      }
    }
  };

  const handleSendFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupText.trim() || isGenerating) return;
    onExecuteCommand(followupText);
    setFollowupText('');
  };

  const getCapabilityTitle = (cap: CapabilityId) => {
    switch (cap) {
      case 'build': return 'BUILD · AI Product Builder';
      case 'code': return 'CODE · Architecture & Debug';
      case 'research': return 'RESEARCH · Synthesis & Grounding';
      case 'analyze': return 'ANALYZE · Context Ingestion';
      case 'automate': return 'AUTOMATE · Workflow Engine';
      case 'agents': return 'AGENTS · Multi-Agent Swarm';
      case 'voice': return 'VOICE · Realtime Dialogue';
      case 'ask':
      default: return 'ASK · Executive Reasoning';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-[#F1F4F3] overflow-hidden">
      
      {/* Workspace Header */}
      <header className="h-13 sm:h-14 px-3 sm:px-5 flex items-center justify-between border-b border-[#121517] bg-[#050607]/80 backdrop-blur-md shrink-0">
        
        {/* Left: Back Arrow + Island Brand + Capability */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBackToIsland}
            aria-label="Return to Island"
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] rounded-full bg-[#111416] hover:bg-[#171B1D] border border-[#202629] text-xs text-[#778184] hover:text-[#F1F4F3] hover:border-[#353F44] transition-all active:scale-95 touch-manipulation"
            title="Return to Island Command Surface"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D8FF65]" />
            <span className="font-semibold text-[#F1F4F3] hidden xs:inline">Island</span>
          </button>

          <div className="h-4 w-[1px] bg-[#202629] hidden xs:block" />

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-extrabold tracking-tight text-[#F1F4F3] truncate">
              ISLAND AI
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#8FF3DF] font-semibold truncate">
              {getCapabilityTitle(capability)}
            </span>
          </div>
        </div>

        {/* Right: View Toggles & Model Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {capability !== 'ask' && (
            <div className="flex items-center bg-[#111416] p-0.5 rounded-full border border-[#202629] text-[9px] sm:text-[10px]">
              <button
                onClick={() => setViewMode('specialized')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all min-h-[32px] flex items-center active:scale-95 touch-manipulation ${
                  viewMode === 'specialized' ? 'bg-[#202629] text-[#D8FF65]' : 'text-[#778184] hover:text-[#F1F4F3]'
                }`}
              >
                Specialized
              </button>
              <button
                onClick={() => setViewMode('flow')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all min-h-[32px] flex items-center active:scale-95 touch-manipulation ${
                  viewMode === 'flow' ? 'bg-[#202629] text-[#F1F4F3]' : 'text-[#778184] hover:text-[#F1F4F3]'
                }`}
              >
                Raw Flow
              </button>
            </div>
          )}

          <span className="px-2.5 py-1 rounded-full bg-[#111416] border border-[#202629] text-[9px] sm:text-[10px] text-[#9CA4A5] font-mono hidden sm:inline-block">
            {model}
          </span>
        </div>

      </header>

      {/* Main Workspace Body */}
      {viewMode === 'specialized' && capability !== 'ask' ? (
        <div className="flex-1 flex flex-col min-h-0 p-2 sm:p-4 overflow-hidden">
          {/* Loading Indicator when generating */}
          {isGenerating && (
            <div className="mb-2 p-2.5 rounded-[16px] bg-[#0B0E10] border border-[#202629] flex items-center justify-between shrink-0 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D8FF65] animate-ping" />
                <span className="text-xs text-[#D8FF65] font-medium">Synthesizing output...</span>
              </div>
              <span className="text-[10px] font-mono text-[#778184]">Streaming Tokens</span>
            </div>
          )}

          {capability === 'build' && (
            <BuildWorkspace
              instruction={latestUserMessage?.content || ''}
              responseContent={latestAssistantMessage?.content || 'Synthesizing build specification...'}
            />
          )}

          {capability === 'code' && (
            <CodeWorkspace
              instruction={latestUserMessage?.content || ''}
              responseContent={latestAssistantMessage?.content || ''}
              onFollowup={(text) => onExecuteCommand(text, 'code')}
            />
          )}

          {capability === 'research' && (
            <ResearchWorkspace
              instruction={latestUserMessage?.content || ''}
              responseContent={latestAssistantMessage?.content || ''}
              sources={latestAssistantMessage?.metadata?.researchSources}
            />
          )}

          {capability === 'automate' && (
            <AutomationWorkspace
              instruction={latestUserMessage?.content || ''}
              responseContent={latestAssistantMessage?.content || ''}
            />
          )}

          {capability === 'agents' && (
            <AgentsWorkspace
              instruction={latestUserMessage?.content || ''}
              responseContent={latestAssistantMessage?.content || ''}
              onDelegateToAgent={(agent, prompt) => onExecuteCommand(`[Delegated to ${agent}]: ${prompt}`, 'agents')}
            />
          )}

          {capability === 'voice' && (
            <VoiceWorkspace
              instruction={latestUserMessage?.content || ''}
              responseContent={latestAssistantMessage?.content || ''}
              onVoiceTranscribed={(text) => onExecuteCommand(text, 'voice')}
            />
          )}

          {capability === 'analyze' && (
            <AnalyzeWorkspace
              instruction={latestUserMessage?.content || ''}
              responseContent={latestAssistantMessage?.content || ''}
              context={attachedContext}
            />
          )}
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto min-h-0 p-2 sm:p-5 touch-scroll scroll-container">
          {/* Loading Indicator when generating */}
          {isGenerating && (
            <div className="mb-3 p-3.5 rounded-[18px] bg-[#0B0E10] border border-[#202629] flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D8FF65] animate-ping" />
                <span className="text-xs text-[#D8FF65] font-medium">Synthesizing output...</span>
              </div>
              <span className="text-[10px] font-mono text-[#778184]">Streaming Tokens</span>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pt-2 pb-16 sm:pb-24">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Role Header */}
                <div className="text-[10px] uppercase tracking-wider text-[#778184] mb-1 px-1 font-mono">
                  {msg.role === 'user' ? 'Instruction' : `Island · ${msg.model}`}
                </div>

                {/* Message Bubble */}
                <div
                  className={`w-full rounded-[20px] sm:rounded-[22px] p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#111416] border border-[#202629] text-[#F1F4F3] max-w-2xl'
                      : 'bg-[#0B0E10] border border-[#202629] text-[#E1E7E6]'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <TypewriterText
                      text={msg.content}
                      isStreaming={isGenerating && idx === messages.length - 1}
                      speed={8}
                      chunkSize={3}
                      className="font-sans leading-relaxed"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans space-y-2">
                      {msg.content}
                    </div>
                  )}

                  {/* Contextual Response Actions (Per Spec: Explain, Rewrite, Build, Research, Code, Export) */}
                  {msg.role === 'assistant' && (
                    <div className="mt-4 pt-3 border-t border-[#202629] flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-[#778184] mr-1 uppercase font-semibold">Transform:</span>
                      {['Explain', 'Rewrite', 'Build', 'Research', 'Code', 'Export'].map((action) => (
                        <button
                          key={action}
                          onClick={() => handleAction(action)}
                          className="px-3 py-1.5 min-h-[36px] flex items-center rounded-full bg-[#111416] hover:bg-[#171B1D] active:scale-95 border border-[#202629] hover:border-[#353F44] text-[11px] text-[#9CA4A5] hover:text-[#F1F4F3] transition-all touch-manipulation"
                        >
                          {action === 'Export' && copied ? '✓ Copied' : action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>
      )}

      {/* Persistent Follow-up Composer at Bottom of Island */}
      <footer className="p-2.5 sm:p-3 bg-[#050607] border-t border-[#121517] shrink-0">
        <form onSubmit={handleSendFollowup} className="max-w-3xl mx-auto flex items-center gap-2 bg-[#0B0E10] border border-[#202629] rounded-[20px] px-3 py-1.5 focus-within:border-[#353F44] transition-all">
          <input
            type="text"
            value={followupText}
            onChange={(e) => setFollowupText(e.target.value)}
            placeholder="Command Island or iterate on output..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#F1F4F3] placeholder:text-[#555F61] focus:outline-none py-1.5 min-h-[40px]"
          />
          <button
            type="submit"
            disabled={!followupText.trim() || isGenerating}
            className="w-9 h-9 rounded-full bg-[#D8FF65] text-[#050607] flex items-center justify-center shrink-0 disabled:opacity-30 hover:brightness-105 active:scale-95 transition-all touch-manipulation"
            aria-label="Send Follow-up"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </footer>

    </div>
  );
};
