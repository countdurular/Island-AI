import React, { useState } from 'react';
import { History, Play, Trash2, X, Copy, Check, Search, Sparkles, Clock } from 'lucide-react';
import { CapabilityId, RecentCommand } from '../../types';

interface RecentCommandsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  commands: RecentCommand[];
  onReExecute: (query: string, capability?: CapabilityId) => void;
  onClearAll: () => void;
  onDeleteCommand: (id: string) => void;
}

const CAPABILITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  build: { bg: 'bg-[#FFB86C]/10', text: 'text-[#FFB86C]', border: 'border-[#FFB86C]/30' },
  research: { bg: 'bg-[#50FA7B]/10', text: 'text-[#50FA7B]', border: 'border-[#50FA7B]/30' },
  code: { bg: 'bg-[#8FF3DF]/10', text: 'text-[#8FF3DF]', border: 'border-[#8FF3DF]/30' },
  analyze: { bg: 'bg-[#BD93F9]/10', text: 'text-[#BD93F9]', border: 'border-[#BD93F9]/30' },
  ask: { bg: 'bg-[#D8FF65]/10', text: 'text-[#D8FF65]', border: 'border-[#D8FF65]/30' },
  automate: { bg: 'bg-[#FF79C6]/10', text: 'text-[#FF79C6]', border: 'border-[#FF79C6]/30' },
  agents: { bg: 'bg-[#F1FA8C]/10', text: 'text-[#F1FA8C]', border: 'border-[#F1FA8C]/30' },
  voice: { bg: 'bg-[#8BE9FD]/10', text: 'text-[#8BE9FD]', border: 'border-[#8BE9FD]/30' },
};

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export const RecentCommandsSidebar: React.FC<RecentCommandsSidebarProps> = ({
  isOpen,
  onClose,
  commands,
  onReExecute,
  onClearAll,
  onDeleteCommand,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = commands.filter((c) =>
    c.query.toLowerCase().includes(search.toLowerCase()) ||
    c.capability.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (e: React.MouseEvent, cmd: RecentCommand) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd.query);
    setCopiedId(cmd.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <aside
      className="w-72 sm:w-80 border-l border-[#1A1F22] bg-[#07090B] flex flex-col h-full shrink-0 z-20 shadow-2xl animate-in slide-in-from-right-4 duration-200 select-none"
      aria-label="Recent Commands Sidebar"
    >
      {/* Sidebar Header */}
      <div className="h-13 sm:h-14 px-3 sm:px-4 flex items-center justify-between border-b border-[#14181B] bg-[#0A0D0F]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#14181B] border border-[#202629] flex items-center justify-center text-[#D8FF65]">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-[#F1F4F3] tracking-tight">Recent Commands</h3>
              <span className="px-1.5 py-0.2 rounded-full bg-[#181D20] text-[9px] font-mono text-[#D8FF65]">
                {commands.length}
              </span>
            </div>
            <p className="text-[9px] text-[#778184]">Click any query to re-execute</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {commands.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="p-1.5 rounded-md hover:bg-[#181D20] text-[#778184] hover:text-[#FF5555] transition-colors"
              title="Clear all recent commands"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#181D20] text-[#778184] hover:text-[#F1F4F3] transition-colors"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {commands.length > 3 && (
        <div className="p-2 border-b border-[#14181B] bg-[#0A0D0F]/50">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E1114] border border-[#1A1F22] focus-within:border-[#353F44] transition-colors">
            <Search className="w-3 h-3 text-[#555F61]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search previous queries..."
              className="w-full bg-transparent text-[11px] text-[#F1F4F3] placeholder:text-[#555F61] focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[#778184] hover:text-[#F1F4F3]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Command List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 touch-scroll">
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#111416] border border-[#202629] flex items-center justify-center mx-auto mb-2 text-[#555F61]">
              <History className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-[#9CA4A5]">No recent commands</p>
            <p className="text-[10px] text-[#555F61] mt-1 max-w-[200px] mx-auto">
              {search ? 'No commands match your filter.' : 'Queries you run will appear here for one-click re-execution.'}
            </p>
          </div>
        ) : (
          filtered.map((cmd) => {
            const capStyle = CAPABILITY_COLORS[cmd.capability] || {
              bg: 'bg-white/10',
              text: 'text-white',
              border: 'border-white/20',
            };

            return (
              <div
                key={cmd.id}
                onClick={() => onReExecute(cmd.query, cmd.capability)}
                className="group relative p-2.5 rounded-xl bg-[#0D1012] hover:bg-[#14181C] border border-[#181D20] hover:border-[#2F373B] transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                {/* Meta Row: Capability Tag + Timestamp */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-semibold uppercase tracking-wider border ${capStyle.bg} ${capStyle.text} ${capStyle.border}`}
                  >
                    {cmd.capability}
                  </span>

                  <div className="flex items-center gap-1 text-[9px] text-[#555F61] font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatRelativeTime(cmd.timestamp)}</span>
                  </div>
                </div>

                {/* Query Text */}
                <p className="text-[11px] text-[#D1D7D6] group-hover:text-[#FFFFFF] leading-snug line-clamp-3 font-medium">
                  {cmd.query}
                </p>

                {/* Quick Actions (Run, Copy, Delete) */}
                <div className="mt-2 pt-1.5 border-t border-[#14181B] flex items-center justify-between text-[9px] text-[#778184]">
                  <span className="flex items-center gap-1 group-hover:text-[#D8FF65] transition-colors font-medium">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Click to re-run</span>
                  </span>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, cmd)}
                      className="p-1 rounded hover:bg-[#1E2428] text-[#778184] hover:text-[#F1F4F3] transition-colors"
                      title="Copy query text"
                    >
                      {copiedId === cmd.id ? (
                        <Check className="w-3 h-3 text-[#D8FF65]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCommand(cmd.id);
                      }}
                      className="p-1 rounded hover:bg-[#1E2428] text-[#778184] hover:text-[#FF5555] transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="p-2 border-t border-[#14181B] bg-[#0A0D0F] text-center">
        <span className="text-[9px] text-[#555F61] flex items-center justify-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#D8FF65]" /> Saved locally in Island history
        </span>
      </div>
    </aside>
  );
};
