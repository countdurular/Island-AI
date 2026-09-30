import React, { useEffect, useRef } from 'react';
import { Trash2, Palette, AlertCircle, Settings, RotateCcw, Copy, Check } from 'lucide-react';
import { IslandTheme } from '../../types';

interface IslandContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  onClearCache: () => void;
  onToggleTheme: () => void;
  onReportIssue: () => void;
  onOpenSettings: () => void;
  onResetIsland: () => void;
  currentTheme: IslandTheme;
}

export const IslandContextMenu: React.FC<IslandContextMenuProps> = ({
  x,
  y,
  isOpen,
  onClose,
  onClearCache,
  onToggleTheme,
  onReportIssue,
  onOpenSettings,
  onResetIsland,
  currentTheme,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copiedDiag, setCopiedDiag] = React.useState(false);

  // Close on click outside or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ensure menu stays within viewport bounds
  const menuWidth = 220;
  const menuHeight = 260;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const adjustedX = Math.min(x, screenWidth - menuWidth - 16);
  const adjustedY = Math.min(y, screenHeight - menuHeight - 16);

  const handleCopyDiagnostics = () => {
    const diag = {
      app: 'Island AI Wrapper',
      time: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent,
      theme: currentTheme,
    };
    navigator.clipboard.writeText(JSON.stringify(diag, null, 2));
    setCopiedDiag(true);
    setTimeout(() => {
      setCopiedDiag(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      ref={menuRef}
      style={{
        top: `${adjustedY}px`,
        left: `${adjustedX}px`,
      }}
      className="fixed z-50 w-56 bg-[#0B0E10] border border-[#202629] rounded-[20px] p-1.5 shadow-2xl shadow-black/80 text-xs animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#778184] font-semibold border-b border-[#1A1F22] mb-1 flex items-center justify-between">
        <span>Island Fast Actions</span>
        <span className="text-[#D8FF65] capitalize">{currentTheme}</span>
      </div>

      <div className="space-y-0.5">
        
        {/* Clear Cache */}
        <button
          onClick={() => {
            onClearCache();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-left text-[#E1E7E6] hover:text-[#FF6E6E] hover:bg-[#15191C] transition-colors active:scale-95 touch-manipulation"
        >
          <Trash2 className="w-3.5 h-3.5 text-[#FF6E6E]" />
          <span>Clear Cache & State</span>
        </button>

        {/* Toggle Theme */}
        <button
          onClick={() => {
            onToggleTheme();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-left text-[#E1E7E6] hover:text-[#D8FF65] hover:bg-[#15191C] transition-colors active:scale-95 touch-manipulation"
        >
          <div className="flex items-center gap-2.5">
            <Palette className="w-3.5 h-3.5 text-[#D8FF65]" />
            <span>Toggle Theme</span>
          </div>
          <span className="text-[10px] font-mono text-[#778184] capitalize">
            {currentTheme}
          </span>
        </button>

        {/* Reset Island */}
        <button
          onClick={() => {
            onResetIsland();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-left text-[#E1E7E6] hover:text-[#8FF3DF] hover:bg-[#15191C] transition-colors active:scale-95 touch-manipulation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8FF3DF]" />
          <span>Reset Current Workspace</span>
        </button>

        {/* Copy Diagnostics */}
        <button
          onClick={handleCopyDiagnostics}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-left text-[#E1E7E6] hover:text-[#F1F4F3] hover:bg-[#15191C] transition-colors active:scale-95 touch-manipulation"
        >
          {copiedDiag ? (
            <Check className="w-3.5 h-3.5 text-[#D8FF65]" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-[#778184]" />
          )}
          <span>{copiedDiag ? 'Copied Diagnostics' : 'Copy System Diag'}</span>
        </button>

        <div className="my-1 border-t border-[#1A1F22]" />

        {/* Report Issue */}
        <button
          onClick={() => {
            onReportIssue();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-left text-[#E1E7E6] hover:text-[#FFBD59] hover:bg-[#15191C] transition-colors active:scale-95 touch-manipulation"
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#FFBD59]" />
          <span>Report Issue</span>
        </button>

        {/* Open Settings */}
        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-left text-[#E1E7E6] hover:text-[#F1F4F3] hover:bg-[#15191C] transition-colors active:scale-95 touch-manipulation"
        >
          <Settings className="w-3.5 h-3.5 text-[#778184]" />
          <span>Island Settings</span>
        </button>

      </div>
    </div>
  );
};
