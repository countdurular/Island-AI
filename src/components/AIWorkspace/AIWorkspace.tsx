import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  Terminal, 
  Layout, 
  Search, 
  Zap, 
  Bot, 
  Radio, 
  FileSearch, 
  HelpCircle,
  History,
  Mic,
  MicOff
} from 'lucide-react';
import { CapabilityId, Message, AttachedContext, RecentCommand } from '../../types';
import { TypewriterText } from '../TypewriterText';
import { BuildWorkspace } from '../CapabilityWorkspace/BuildWorkspace';
import { CodeWorkspace } from '../CapabilityWorkspace/CodeWorkspace';
import { ResearchWorkspace } from '../CapabilityWorkspace/ResearchWorkspace';
import { AutomationWorkspace } from '../CapabilityWorkspace/AutomationWorkspace';
import { AgentsWorkspace } from '../CapabilityWorkspace/AgentsWorkspace';
import { VoiceWorkspace } from '../CapabilityWorkspace/VoiceWorkspace';
import { AnalyzeWorkspace } from '../CapabilityWorkspace/AnalyzeWorkspace';
import { RecentCommandsSidebar } from './RecentCommandsSidebar';
import { useSpeechRecognition } from '../../lib/useSpeechRecognition';
import { 
  getRecentCommands, 
  clearRecentCommands, 
  deleteRecentCommand, 
  subscribeRecentCommands,
  addRecentCommand
} from '../../lib/recentCommandsStore';

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
  const [isRecentCommandsOpen, setIsRecentCommandsOpen] = useState(false);
  const [recentCommands, setRecentCommands] = useState<RecentCommand[]>(() => getRecentCommands());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const baseFollowupRef = useRef('');

  // Subscribe to real-time Recent Commands updates
  useEffect(() => {
    const unsubscribe = subscribeRecentCommands((cmds) => {
      setRecentCommands(cmds);
    });
    return unsubscribe;
  }, []);

  // Web Speech API Voice Recognition for Follow-up Input
  const {
    isSupported: isFollowupSpeechSupported,
    isListening: isFollowupSpeechListening,
    startListening: startFollowupSpeech,
    stopListening: stopFollowupSpeech,
    error: followupSpeechError,
  } = useSpeechRecognition({
    onTranscriptChange: (transcriptText) => {
      const base = baseFollowupRef.current;
      setFollowupText(base ? `${base} ${transcriptText}` : transcriptText);
    },
  });

  const handleToggleFollowupSpeech = () => {
    if (isFollowupSpeechListening) {
      stopFollowupSpeech();
    } else {
      baseFollowupRef.current = followupText.trim();
      startFollowupSpeech();
    }
  };

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

  // Re-run previous user query from Recent Commands sidebar
  const handleReExecuteRecent = (query: string, overrideCap?: CapabilityId) => {
    onExecuteCommand(query, overrideCap);
    addRecentCommand(query, overrideCap || capability, model);
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

        {/* Right: View Toggles, Recent Commands Trigger & Model Pill */}
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

          {/* Recent Commands Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setIsRecentCommandsOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 min-h-[32px] rounded-full border text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 touch-manipulation ${
              isRecentCommandsOpen
                ? 'bg-[#D8FF65] text-[#0A0D0F] border-[#D8FF65] font-semibold shadow-md'
                : 'bg-[#111416] hover:bg-[#181D20] text-[#9CA4A5] hover:text-[#F1F4F3] border-[#202629]'
            }`}
            title="Toggle Recent Commands Sidebar"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Recent</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                isRecentCommandsOpen ? 'bg-black/20 text-black font-bold' : 'bg-[#1A2024] text-[#D8FF65]'
              }`}
            >
              {recentCommands.length}
            </span>
          </button>

          <span className="px-2.5 py-1 rounded-full bg-[#111416] border border-[#202629] text-[9px] sm:text-[10px] text-[#9CA4A5] font-mono hidden sm:inline-block">
            {model}
          </span>
        </div>

      </header>

      {/* Main Container with Workspace Body & Recent Commands Sidebar */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        
        {/* Active Workspace View Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
                  responseContent={latestAssistantMessage?.content || 'Synthesizing code architecture...'}
                  onFollowup={(actionText) => onExecuteCommand(actionText, 'code')}
                />
              )}

              {capability === 'research' && (
                <ResearchWorkspace
                  instruction={latestUserMessage?.content || ''}
                  responseContent={latestAssistantMessage?.content || 'Compiling verified research synthesis...'}
                />
              )}

              {capability === 'analyze' && (
                <AnalyzeWorkspace
                  instruction={latestUserMessage?.content || ''}
                  responseContent={latestAssistantMessage?.content || 'Performing multi-vector context analysis...'}
                  context={attachedContext}
                />
              )}

              {capability === 'automate' && (
                <AutomationWorkspace
                  instruction={latestUserMessage?.content || ''}
                  responseContent={latestAssistantMessage?.content || 'Compiling trigger-action automation pipeline...'}
                />
              )}

              {capability === 'agents' && (
                <AgentsWorkspace
                  instruction={latestUserMessage?.content || ''}
                  responseContent={latestAssistantMessage?.content || 'Deploying multi-agent coordination swarm...'}
                  onDelegateToAgent={(agentName, prompt) =>
                    onExecuteCommand(`[Delegated to ${agentName}]: ${prompt}`, 'agents')
                  }
                />
              )}

              {capability === 'voice' && (
                <VoiceWorkspace
                  instruction={latestUserMessage?.content || ''}
                  responseContent={latestAssistantMessage?.content || 'Realtime acoustic synthesis active...'}
                  onVoiceTranscribed={(text) => onExecuteCommand(text, 'voice')}
                />
              )}
            </div>
          ) : (
            <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 touch-scroll scroll-container">
              <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
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

                      {/* Contextual Response Actions (Explain, Rewrite, Build, Research, Code, Export) */}
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
        </div>

        {/* Recent Commands Sidebar */}
        <RecentCommandsSidebar
          isOpen={isRecentCommandsOpen}
          onClose={() => setIsRecentCommandsOpen(false)}
          commands={recentCommands}
          onReExecute={handleReExecuteRecent}
          onClearAll={() => setRecentCommands(clearRecentCommands())}
          onDeleteCommand={(id) => setRecentCommands(deleteRecentCommand(id))}
        />

      </div>

      {/* Persistent Follow-up Composer with Web Speech API Microphone Trigger */}
      <footer className="p-2.5 sm:p-3 bg-[#050607] border-t border-[#121517] shrink-0">
        <form onSubmit={handleSendFollowup} className="max-w-3xl mx-auto flex items-center gap-2 bg-[#0B0E10] border border-[#202629] rounded-[20px] px-3 py-1.5 focus-within:border-[#353F44] transition-all">
          <input
            type="text"
            value={followupText}
            onChange={(e) => setFollowupText(e.target.value)}
            placeholder="Command Island or iterate on output..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#F1F4F3] placeholder:text-[#555F61] focus:outline-none py-1.5 min-h-[40px]"
          />

          {/* Microphone Voice Trigger in Follow-up */}
          <button
            type="button"
            onClick={handleToggleFollowupSpeech}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
              isFollowupSpeechListening
                ? 'bg-[#FF5555] text-white ring-2 ring-[#FF5555]/40 animate-pulse'
                : 'bg-[#14181B] hover:bg-[#1C2226] text-[#778184] hover:text-[#D8FF65]'
            }`}
            title={
              isFollowupSpeechListening
                ? 'Listening to speech... Click to stop (Web Speech API)'
                : isFollowupSpeechSupported
                ? 'Speak follow-up hands-free (Web Speech API)'
                : 'Web Speech API is not supported in this browser'
            }
          >
            {isFollowupSpeechListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <button
            type="submit"
            disabled={!followupText.trim() || isGenerating}
            className="w-9 h-9 rounded-full bg-[#D8FF65] text-[#050607] flex items-center justify-center shrink-0 disabled:opacity-30 hover:brightness-105 active:scale-95 transition-all touch-manipulation"
            aria-label="Send Follow-up"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {isFollowupSpeechListening && (
          <div className="max-w-3xl mx-auto flex items-center gap-2 px-3 pt-1.5 text-[10px] text-[#FF5555] font-mono animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5555] animate-ping" />
            <span>Listening... Speak follow-up hands-free</span>
          </div>
        )}
        {followupSpeechError && (
          <div className="max-w-3xl mx-auto px-3 pt-1 text-[10px] text-[#FFB86C] font-mono">
            {followupSpeechError}
          </div>
        )}
      </footer>

    </div>
  );
};
