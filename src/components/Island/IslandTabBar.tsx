import React from 'react';
import { Plus, X, Home, Sparkles, Terminal, Layout, Search, Zap, Bot, Radio, FileSearch } from 'lucide-react';
import { WorkspaceSession, CapabilityId } from '../../types';

interface IslandTabBarProps {
  sessions: WorkspaceSession[];
  activeSessionId: string | null; // null represents Home / Command Surface
  onSelectHome: () => void;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onCloseSession: (id: string, e: React.MouseEvent) => void;
}

const getCapabilityIcon = (cap: CapabilityId) => {
  switch (cap) {
    case 'build':
      return <Layout className="w-3 h-3 text-[#D8FF65]" />;
    case 'code':
      return <Terminal className="w-3 h-3 text-[#8FF3DF]" />;
    case 'research':
      return <Search className="w-3 h-3 text-[#8FF3DF]" />;
    case 'automate':
      return <Zap className="w-3 h-3 text-[#D8FF65]" />;
    case 'agents':
      return <Bot className="w-3 h-3 text-[#8FF3DF]" />;
    case 'voice':
      return <Radio className="w-3 h-3 text-[#D8FF65]" />;
    case 'analyze':
      return <FileSearch className="w-3 h-3 text-[#8FF3DF]" />;
    case 'ask':
    default:
      return <Sparkles className="w-3 h-3 text-[#D8FF65]" />;
  }
};

export const IslandTabBar: React.FC<IslandTabBarProps> = ({
  sessions,
  activeSessionId,
  onSelectHome,
  onSelectSession,
  onNewSession,
  onCloseSession,
}) => {
  const isHomeActive = activeSessionId === null;

  return (
    <div className="w-full bg-[#050607] border-b border-[#17191B] px-2 py-1.5 flex items-center justify-between gap-1 shrink-0 select-none overflow-x-auto no-scrollbar touch-scroll">
      
      {/* Tabs Container */}
      <div className="flex items-center gap-1.5 min-w-0">
        
        {/* Home / Command Surface Tab */}
        <button
          onClick={onSelectHome}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 active:scale-95 touch-manipulation ${
            isHomeActive
              ? 'bg-[#171B1D] text-[#F1F4F3] border border-[#2A3135] shadow-sm'
              : 'text-[#778184] hover:text-[#F1F4F3] hover:bg-[#0B0E10] border border-transparent'
          }`}
          title="Return to Universal Command Surface"
        >
          <Home className={`w-3.5 h-3.5 ${isHomeActive ? 'text-[#D8FF65]' : ''}`} />
          <span className="hidden xs:inline text-[11px]">Command</span>
        </button>

        {/* Dynamic Workspace Session Tabs */}
        {sessions.map((session) => {
          const isActive = activeSessionId === session.id;
          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 max-w-[170px] sm:max-w-[210px] active:scale-95 touch-manipulation border ${
                isActive
                  ? 'bg-[#111416] text-[#F1F4F3] border-[#2A3135] shadow-sm ring-1 ring-[#D8FF65]/20'
                  : 'bg-[#08090A] text-[#778184] hover:text-[#F1F4F3] hover:bg-[#0E1113] border-[#17191B]'
              }`}
            >
              <span className="shrink-0">{getCapabilityIcon(session.capability)}</span>
              
              <span className="truncate text-[11px] font-medium">
                {session.title || 'Untitled Workspace'}
              </span>

              {session.messages.length > 0 && (
                <span className="text-[9px] px-1 py-0.2 rounded-full bg-[#1A1F22] text-[#8FF3DF] font-mono shrink-0">
                  {session.messages.filter((m) => m.role === 'assistant').length}
                </span>
              )}

              {/* Close Tab Button */}
              <button
                type="button"
                onClick={(e) => onCloseSession(session.id, e)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[#555F61] hover:text-[#FF6E6E] hover:bg-[#1E2326] transition-colors ml-0.5 shrink-0"
                title="Close Tab"
                aria-label="Close Tab"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}

        {/* New Workspace Tab Button */}
        <button
          onClick={onNewSession}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-[#778184] hover:text-[#D8FF65] bg-[#090B0D] hover:bg-[#111416] border border-[#17191B] hover:border-[#202629] transition-all shrink-0 active:scale-95 touch-manipulation"
          title="Create New Workspace Tab"
          aria-label="New Tab"
        >
          <Plus className="w-3 h-3" />
          <span className="text-[11px] hidden sm:inline">New Tab</span>
        </button>

      </div>

      {/* Right Session Counter Indicator */}
      <div className="hidden md:flex items-center gap-1.5 text-[10px] text-[#555F61] font-mono shrink-0 pr-2">
        <span>{sessions.length + 1} instances</span>
      </div>

    </div>
  );
};
