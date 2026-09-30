import React from 'react';
import { ChevronDown, ChevronUp, Settings, Minimize2 } from 'lucide-react';
import { IslandState, ModelId } from '../../types';

interface IslandHeaderProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  state: IslandState;
  model: ModelId;
  onOpenSettings: () => void;
}

export const IslandHeader: React.FC<IslandHeaderProps> = ({
  isExpanded,
  onToggleExpand,
  state,
  model,
  onOpenSettings,
}) => {
  const isBusy = state === 'thinking' || state === 'synthesizing' || state === 'building';

  const formatStateText = (s: IslandState) => {
    switch (s) {
      case 'thinking': return 'Thinking...';
      case 'synthesizing': return 'Synthesizing...';
      case 'building': return 'Building...';
      case 'listening': return 'Listening...';
      case 'ready':
      default: return 'Ready';
    }
  };

  return (
    <header 
      onClick={!isExpanded ? onToggleExpand : undefined}
      className={`h-12 sm:h-12 flex items-center justify-between px-3 sm:px-4 border-b shrink-0 select-none ${
        isExpanded ? 'border-[#121517] bg-[#000000]' : 'border-transparent bg-[#000000] cursor-pointer'
      }`}
    >
      
      {/* Left: Status Dot & Brand */}
      <div
        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer min-h-[44px]"
        onClick={onToggleExpand}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
            isBusy
              ? 'bg-[#8FF3DF] shadow-[0_0_12px_#8FF3DF] animate-pulse'
              : 'bg-[#D8FF65] shadow-[0_0_10px_rgba(216,255,101,0.7)]'
          }`}
        />
        <span className="text-xs sm:text-xs font-black tracking-tight text-[#F1F4F3] whitespace-nowrap">
          ISLAND AI
        </span>
        <span className="text-[10px] text-[#778184] font-medium truncate">
          {formatStateText(state)}
        </span>
      </div>

      {/* Right: Model Badge, Settings & Collapse / Expand Button */}
      <div className="flex items-center gap-1 ml-2 shrink-0">
        {isExpanded && (
          <>
            <span className="px-2.5 py-1 rounded-full bg-[#111416] border border-[#202629] text-[9px] uppercase tracking-wider text-[#9CA4A5] font-mono hidden xs:inline-block">
              {model}
            </span>

            {/* Settings Trigger with ≥ 44 x 44px touch hitbox */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#151719] hover:bg-[#202426] text-[#778184] hover:text-[#F1F4F3] flex items-center justify-center transition-colors active:scale-95"
              title="Provider Settings"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Explicit Collapse / Return to Idle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#151719] hover:bg-[#202426] text-[#9CA4A5] hover:text-[#F1F4F3] border border-[#202629] text-[11px] font-medium transition-all active:scale-95"
              title="Collapse / Return to Idle (ESC)"
              aria-label="Collapse / Return to Idle"
            >
              <Minimize2 className="w-3 h-3 text-[#D8FF65]" />
              <span className="hidden sm:inline">Return</span>
            </button>
          </>
        )}

        {/* Toggle Expand / Collapse with ≥ 44 x 44px touch hitbox */}
        {!isExpanded && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#151719] hover:bg-[#202426] text-[#F1F4F3] flex items-center justify-center transition-colors active:scale-95"
            title="Expand Island"
            aria-label="Expand Island"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

    </header>
  );
};
