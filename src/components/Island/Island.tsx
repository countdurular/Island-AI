import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IslandHeader } from './IslandHeader';
import { IslandTabBar } from './IslandTabBar';
import { IslandContextMenu } from './IslandContextMenu';
import { IssueReportModal } from './IssueReportModal';
import { AmbientNewsFeeds, NewsItem } from '../AmbientNews/AmbientNewsFeeds';
import { CommandSurface } from '../CommandSurface/CommandSurface';
import { AIWorkspace } from '../AIWorkspace/AIWorkspace';
import { SettingsModal } from '../Settings/SettingsModal';
import { ContextModal } from '../ContextModal/ContextModal';
import { 
  CapabilityId, 
  ModelId, 
  AttachedContext, 
  Message, 
  IslandState, 
  ProviderSettings,
  WorkspaceSession,
  IslandTheme 
} from '../../types';
import { defaultProviderAdapter } from '../../lib/providerAdapter';

interface IslandDimensions {
  maxWidth: string;
  width: string;
  height: string;
  borderRadius: string;
}

export const Island: React.FC = () => {
  // Primary State Architecture
  const [islandOpen, setIslandOpen] = useState(false);
  const [currentCapability, setCurrentCapability] = useState<CapabilityId>('ask');
  const [selectedModel, setSelectedModel] = useState<ModelId>('auto');
  const [attachedContext, setAttachedContext] = useState<AttachedContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [executingSessionId, setExecutingSessionId] = useState<string | null>(null);
  const [islandState, setIslandState] = useState<IslandState>('ready');

  // Multi-Instance Active Workspaces Session State
  const [sessions, setSessions] = useState<WorkspaceSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Theme Management ('obsidian' | 'cyber' | 'teal')
  const [currentTheme, setCurrentTheme] = useState<IslandTheme>('obsidian');

  // Touch tracking and long-press context menu
  const [isTouchActive, setIsTouchActive] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  }>({ isOpen: false, x: 0, y: 0 });

  // Issue Report Modal & System Feedback
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Dynamic Island Dimensions in Component State
  const [dimensions, setDimensions] = useState<IslandDimensions>({
    maxWidth: '220px',
    width: '100%',
    height: '48px',
    borderRadius: '26px',
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);

  // Viewport width detection and dynamic dimension adjustment
  useEffect(() => {
    const updateDimensions = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const isMobileViewport = width < 640;
      const isTabletViewport = width >= 640 && width < 1024;

      if (!islandOpen) {
        // Collapsed floating pill
        setDimensions({
          maxWidth: isMobileViewport ? '210px' : '230px',
          width: isMobileViewport ? 'calc(100vw - 32px)' : '230px',
          height: '48px',
          borderRadius: '26px',
        });
      } else {
        // Expanded Island
        if (isMobileViewport) {
          // Fills mobile screens
          setDimensions({
            maxWidth: 'calc(100vw - 16px)',
            width: 'calc(100vw - 16px)',
            height: 'calc(100dvh - env(safe-area-inset-top, 10px) - env(safe-area-inset-bottom, 10px) - 20px)',
            borderRadius: '24px',
          });
        } else if (isTabletViewport) {
          setDimensions({
            maxWidth: '780px',
            width: 'calc(100vw - 32px)',
            height: activeSessionId ? 'min(780px, calc(100dvh - 40px))' : 'min(710px, calc(100dvh - 40px))',
            borderRadius: '30px',
          });
        } else {
          // Desktop floating surface
          setDimensions({
            maxWidth: activeSessionId ? '860px' : '780px',
            width: '100%',
            height: activeSessionId ? 'min(780px, calc(100dvh - 48px))' : 'min(710px, calc(100dvh - 48px))',
            borderRadius: '32px',
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [islandOpen, activeSessionId]);

  // Global Keyboard Shortcuts (CMD+K / CTRL+K and ESC) for power users
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K toggles the Island open/closed
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIslandOpen((prev) => !prev);
        return;
      }

      // ESC hierarchically steps back: closes modals -> returns to home command surface -> collapses Island
      if (e.key === 'Escape') {
        if (contextMenu.isOpen) {
          setContextMenu((prev) => ({ ...prev, isOpen: false }));
          return;
        }
        if (isIssueModalOpen) {
          setIsIssueModalOpen(false);
          return;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (isContextModalOpen) {
          setIsContextModalOpen(false);
          return;
        }
        if (activeSessionId !== null) {
          setActiveSessionId(null);
          return;
        }
        if (islandOpen) {
          setIslandOpen(false);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [islandOpen, activeSessionId, isSettingsOpen, isContextModalOpen, contextMenu.isOpen, isIssueModalOpen]);

  // Provider Settings
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>({
    openaiBaseUrl: '',
    openaiApiKey: '',
    openaiModel: 'gpt-4o',
    systemInstruction: 'You are ISLAND AI, an advanced AI operating surface and executive intelligence wrapper. Provide precise, highly structured, expert responses without conversational fluff or filler.',
    localBaseUrl: 'http://localhost:11434',
    localModel: 'llama-3.3-70b',
  });

  const handleToggleExpand = () => {
    setIslandOpen((prev) => !prev);
  };

  // Launch brand new workspace tab from universal command surface
  const handleExecuteCommand = async (instruction: string, forcedCapability?: CapabilityId) => {
    if (!instruction.trim()) return;

    setIslandOpen(true);
    const activeCap = forcedCapability || currentCapability;
    setCurrentCapability(activeCap);

    const sessionId = `session-${Date.now()}`;
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: instruction,
      capability: activeCap,
      model: selectedModel,
      timestamp: Date.now(),
    };

    // Instantiate new multi-instance workspace session
    const newSession: WorkspaceSession = {
      id: sessionId,
      title: instruction.length > 24 ? `${instruction.slice(0, 24)}…` : instruction,
      capability: activeCap,
      model: selectedModel,
      messages: [userMsg],
      attachedContext: [...attachedContext],
      createdAt: Date.now(),
    };

    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(sessionId);
    setExecutingSessionId(sessionId);
    setLoading(true);

    if (activeCap === 'build') setIslandState('building');
    else if (activeCap === 'voice') setIslandState('listening');
    else setIslandState('thinking');

    try {
      const result = await defaultProviderAdapter.execute(
        instruction,
        activeCap,
        selectedModel,
        attachedContext,
        providerSettings
      );

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        capability: activeCap,
        model: result.model,
        timestamp: Date.now(),
        isSimulated: result.isSimulated,
        metadata: result.metadata,
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
      );
      setIslandState('ready');
    } catch (err: unknown) {
      console.error('Execution failure:', err);
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `Operational Invariant Exception: ${err instanceof Error ? err.message : 'Unknown execution failure'}`,
        capability: activeCap,
        model: 'Island Kernel (Error)',
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
      setIslandState('ready');
    } finally {
      setLoading(false);
      setExecutingSessionId(null);
    }
  };

  // Followup command within an active workspace tab instance
  const handleExecuteSessionFollowup = async (
    targetSessionId: string,
    instruction: string,
    forcedCapability?: CapabilityId
  ) => {
    if (!instruction.trim()) return;

    const targetSession = sessions.find((s) => s.id === targetSessionId);
    if (!targetSession) return;

    const activeCap = forcedCapability || targetSession.capability;
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: instruction,
      capability: activeCap,
      model: targetSession.model,
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === targetSessionId ? { ...s, messages: [...s.messages, userMsg] } : s))
    );
    setExecutingSessionId(targetSessionId);
    setLoading(true);

    if (activeCap === 'build') setIslandState('building');
    else if (activeCap === 'voice') setIslandState('listening');
    else setIslandState('thinking');

    try {
      const result = await defaultProviderAdapter.execute(
        instruction,
        activeCap,
        targetSession.model,
        targetSession.attachedContext,
        providerSettings
      );

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        capability: activeCap,
        model: result.model,
        timestamp: Date.now(),
        isSimulated: result.isSimulated,
        metadata: result.metadata,
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === targetSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
      );
      setIslandState('ready');
    } catch (err: unknown) {
      console.error('Session execution error:', err);
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `Operational Invariant Exception: ${err instanceof Error ? err.message : 'Unknown execution failure'}`,
        capability: activeCap,
        model: 'Island Kernel (Error)',
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === targetSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
      setIslandState('ready');
    } finally {
      setLoading(false);
      setExecutingSessionId(null);
    }
  };

  const handleCloseSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[remaining.length - 1].id);
      } else {
        setActiveSessionId(null);
      }
    }
  };

  const handleAddContext = (ctx: AttachedContext) => {
    setAttachedContext((prev) => [...prev.filter((c) => c.name !== ctx.name), ctx]);
    showToast(`Attached ${ctx.name}`);
  };

  const handleRemoveContext = (id: string) => {
    setAttachedContext((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearContext = () => {
    setAttachedContext([]);
  };

  // Fast Actions: Clear Cache, Toggle Theme, Reset
  const handleClearCache = () => {
    setSessions([]);
    setActiveSessionId(null);
    setAttachedContext([]);
    setIslandState('ready');
    showToast('Cache & active sessions cleared');
  };

  const handleToggleTheme = () => {
    const nextTheme: IslandTheme = 
      currentTheme === 'obsidian' ? 'cyber' : currentTheme === 'cyber' ? 'teal' : 'obsidian';
    setCurrentTheme(nextTheme);
    showToast(`Switched theme: ${nextTheme.toUpperCase()}`);
  };

  const handleResetIsland = () => {
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s))
      );
      showToast('Workspace conversation reset');
    } else {
      setAttachedContext([]);
      showToast('Command surface reset');
    }
    setIslandState('ready');
  };

  // Ambient News Feed Interaction Handlers - Feeds the LLM live news update
  const handleSelectHeadline = (item: NewsItem) => {
    // 1. Create a rich AttachedContext entity for the LLM
    const newsContext: AttachedContext = {
      id: `ctx-news-${item.id}-${Date.now()}`,
      name: `NEWS // ${item.category}: ${item.headline.slice(0, 24)}...`,
      size: `${item.readTime || '2 min'} read`,
      type: 'text/markdown',
      content: `# LIVE INTELLIGENCE DISPATCH
**Headline:** ${item.headline}
**Category:** ${item.category}
**Source:** ${item.source}
**Timestamp:** ${item.timestamp}

### Context & Technical Summary:
${item.summary}

---
*Received via Island AI Real-Time News Radar*`,
    };

    // Attach to active workspace context
    setAttachedContext([newsContext]);
    setCurrentCapability('research');
    setIslandOpen(true);

    // 2. Feed the LLM with an in-depth synthesis prompt
    const prompt = `LIVE NEWS BRIEFING: Synthesize this breaking technical development:
Headline: "${item.headline}"
Source: ${item.source} (${item.timestamp})
Category: ${item.category}

Context:
${item.summary}

Please provide an executive technical briefing:
1. Executive Summary & Breakthrough Context
2. Technical & Architectural Drivers
3. Ecosystem, Developer & Market Impact
4. Strategic Takeaways & Actionable Next Steps`;

    handleExecuteCommand(prompt, 'research');
    showToast(`Feeding LLM live update: ${item.headline.slice(0, 26)}...`);
  };

  const handleActivateApp = () => {
    if (!islandOpen) {
      setIslandOpen(true);
    }
  };

  // Touch Long-Press Support (500ms) for Context Menu
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouchActive(true);
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    longPressTimerRef.current = setTimeout(() => {
      setContextMenu({ isOpen: true, x: clientX, y: clientY });
      setIsTouchActive(false);
      if ('vibrate' in navigator) navigator.vibrate(40);
    }, 500);
  };

  const handleTouchEnd = () => {
    setIsTouchActive(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
  };

  // Current active workspace session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return (
    <div className={`relative w-full h-[100dvh] overflow-hidden select-none ${
      currentTheme === 'cyber' ? 'bg-[#040804]' : currentTheme === 'teal' ? 'bg-[#030708]' : 'bg-[#050607]'
    }`}>
      
      {/* Ambient Backdrop Grid & Dynamic Theme Radial Glows */}
      <div className="absolute inset-0 ambient-grid pointer-events-none" />
      
      {currentTheme === 'cyber' ? (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-b from-[#D8FF65]/15 via-[#233510]/10 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-t from-[#D8FF65]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
        </>
      ) : currentTheme === 'teal' ? (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-b from-[#8FF3DF]/15 via-[#133036]/10 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-t from-[#8FF3DF]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#476969]/10 via-[#202629]/5 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-[#D8FF65]/3 via-transparent to-transparent blur-3xl pointer-events-none" />
        </>
      )}

      {/* Ambient Corner News Cards (Visible during Idle State) */}
      <AmbientNewsFeeds
        isActive={islandOpen}
        onSelectHeadline={handleSelectHeadline}
        onActivateApp={handleActivateApp}
        onToast={showToast}
      />

      {/* Active State Backdrop - Clicking canvas outside Island returns to Idle */}
      <AnimatePresence>
        {islandOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIslandOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] pointer-events-auto cursor-pointer"
            title="Click outside to collapse & return to idle news feeds (ESC)"
          />
        )}
      </AnimatePresence>

      {/* Floating Island Centered Container - fixed inset-0 flex items-center justify-center z-50 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-2 sm:p-4">
        
        <motion.div
          layout
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 280,
            mass: 0.8,
          }}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={() => {
            if (!islandOpen) setIslandOpen(true);
          }}
          className={`island pointer-events-auto bg-[#000000] border overflow-hidden flex flex-col transition-all duration-200 ${
            isTouchActive ? 'scale-[0.985] border-[#D8FF65]/50 shadow-[0_0_20px_rgba(216,255,101,0.15)]' : 'border-[#17191B]'
          } ${
            islandOpen
              ? activeSessionId
                ? 'island-shadow-active expanded workspace-mode'
                : 'island-shadow expanded'
              : 'island-shadow hover:border-[#2A2E32] cursor-pointer'
          }`}
          style={{
            width: '100%',
            maxWidth: dimensions.maxWidth,
            height: dimensions.height,
            borderRadius: dimensions.borderRadius,
          }}
        >
          {/* Header Bar */}
          <IslandHeader
            isExpanded={islandOpen}
            onToggleExpand={handleToggleExpand}
            state={islandState}
            model={selectedModel}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Multi-Instance Workspace Tab-Bar Component */}
          {islandOpen && (
            <IslandTabBar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectHome={() => setActiveSessionId(null)}
              onSelectSession={(id) => setActiveSessionId(id)}
              onNewSession={() => setActiveSessionId(null)}
              onCloseSession={handleCloseSession}
            />
          )}

          {/* Expanded Content Area */}
          <AnimatePresence mode="wait">
            {islandOpen && (
              <motion.div
                key={activeSessionId ? activeSessionId : 'command-surface-home'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden w-full"
              >
                {activeSessionId === null || !activeSession ? (
                  <CommandSurface
                    onExecuteCommand={handleExecuteCommand}
                    selectedModel={selectedModel}
                    onSelectModel={setSelectedModel}
                    attachedContext={attachedContext}
                    onOpenContextModal={() => setIsContextModalOpen(true)}
                    onClearContext={handleClearContext}
                    onRemoveContextItem={handleRemoveContext}
                    currentCapability={currentCapability}
                    onSelectCapability={(cap) => setCurrentCapability(cap)}
                  />
                ) : (
                  <AIWorkspace
                    onBackToIsland={() => setActiveSessionId(null)}
                    messages={activeSession.messages}
                    capability={activeSession.capability}
                    model={activeSession.model}
                    isGenerating={loading && executingSessionId === activeSession.id}
                    attachedContext={activeSession.attachedContext}
                    onExecuteCommand={(instr, forcedCap) =>
                      handleExecuteSessionFollowup(activeSession.id, instr, forcedCap)
                    }
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Initial Idle Hint at Bottom (Per Spec: "Tap the Island · ⌘K", only shown when collapsed) */}
      <AnimatePresence>
        {!islandOpen && (
          <div className="fixed inset-x-0 bottom-7 sm:bottom-9 z-40 pointer-events-none flex justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIslandOpen(true)}
              className="pointer-events-auto text-xs text-[#555F61] hover:text-[#9CA4A5] tracking-wide cursor-pointer select-none flex items-center gap-1.5 p-3 min-h-[44px] touch-manipulation active:scale-95 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] shadow-[0_0_8px_rgba(216,255,101,0.6)] animate-pulse" />
              <span className="font-medium">Tap the Island</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-[#111416] border border-[#202629] px-1.5 py-0.5 rounded text-[#778184] ml-1">
                ⌘K
              </kbd>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Right-Click & Long-Press Context Menu */}
      <IslandContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onClearCache={handleClearCache}
        onToggleTheme={handleToggleTheme}
        onReportIssue={() => setIsIssueModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetIsland={handleResetIsland}
        currentTheme={currentTheme}
      />

      {/* Issue Report Modal */}
      <IssueReportModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        diagnosticData={{
          theme: currentTheme,
          activeSessionId,
          activeSessionsCount: sessions.length,
          model: selectedModel,
          capability: currentCapability,
          islandOpen,
          state: islandState,
          timestamp: new Date().toISOString(),
        }}
      />

      {/* Fast Action Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-4 right-4 z-50 px-3.5 py-2 rounded-full bg-[#111416] border border-[#2A3135] text-xs text-[#D8FF65] shadow-2xl flex items-center gap-2 pointer-events-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={providerSettings}
        onSaveSettings={setProviderSettings}
      />

      {/* File & Document Context Modal */}
      <ContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        attachedContext={attachedContext}
        onAddContext={handleAddContext}
        onRemoveContext={handleRemoveContext}
      />

    </div>
  );
};
