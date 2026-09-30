import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Newspaper, ArrowUpRight, Sparkles, Clock, RefreshCw, Layers } from 'lucide-react';

export interface NewsItem {
  id: string;
  headline: string;
  category: string;
  source: string;
  timestamp: string;
  readTime: string;
  summary: string;
}

export interface NewsFile {
  id: string;
  title: string;
  fileTag: string;
  categoryName: string;
  accent: 'lime' | 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose';
  column: 'left' | 'right';
  row: number;
  items: NewsItem[];
}

interface AmbientNewsFeedsProps {
  isActive: boolean;
  onSelectHeadline: (item: NewsItem) => void;
  onActivateApp: () => void;
  onToast?: (message: string) => void;
}

const INITIAL_SIX_FILES: NewsFile[] = [
  // LEFT COLUMN (3 Files)
  {
    id: 'file-01',
    title: 'AI Kernel & Reasoning',
    fileTag: 'FILE // 01',
    categoryName: 'AI Core',
    accent: 'lime',
    column: 'left',
    row: 1,
    items: [
      {
        id: 'ai-1',
        headline: 'Autonomous Agents achieve 95.8% on SWE-bench Multimodal tasks',
        category: 'Agents',
        source: 'AI Research Wire',
        timestamp: 'Just now',
        readTime: '2 min',
        summary: 'Deep reasoning graphs coupled with dynamic tool execution reach breakthrough benchmark accuracy.',
      },
      {
        id: 'ai-2',
        headline: 'Ultra-low latency speculative decoding cuts TTFT to 11ms',
        category: 'Silicon',
        source: 'Kernel Dispatch',
        timestamp: '14m',
        readTime: '1 min',
        summary: 'Parallelized token draft heads allow real-time conversational streaming with sub-perceptual lag.',
      },
    ],
  },
  {
    id: 'file-02',
    title: 'Research Dispatches',
    fileTag: 'FILE // 02',
    categoryName: 'Papers',
    accent: 'emerald',
    column: 'left',
    row: 2,
    items: [
      {
        id: 'res-1',
        headline: 'Latent diffusion memory structures solve catastrophic forgetting',
        category: 'DeepMind',
        source: 'ArXiv Wire',
        timestamp: 'Just now',
        readTime: '3 min',
        summary: 'Continuous lifelong learning architectures maintain zero loss across sequential domain training tasks.',
      },
      {
        id: 'res-2',
        headline: 'Token-pruned dynamic sparse attention cuts KV-cache by 74%',
        category: 'Stanford AI',
        source: 'ML Systems',
        timestamp: '38m',
        readTime: '2 min',
        summary: 'Allows active multi-million token contexts on commodity hardware without memory pressure.',
      },
    ],
  },
  {
    id: 'file-03',
    title: 'Silicon & WebGPU',
    fileTag: 'FILE // 03',
    categoryName: 'Hardware',
    accent: 'cyan',
    column: 'left',
    row: 3,
    items: [
      {
        id: 'sil-1',
        headline: 'Native WebGPU tensor cores deployed to production browser engines',
        category: 'WebGPU',
        source: 'Standards',
        timestamp: 'Just now',
        readTime: '2 min',
        summary: 'Unlocks zero-installation client-side neural execution at 85 tokens/sec directly in the browser.',
      },
      {
        id: 'sil-2',
        headline: 'Co-packaged optics achieve sub-5 microsecond die memory latency',
        category: 'Optics',
        source: 'Hardware Pulse',
        timestamp: '45m',
        readTime: '2 min',
        summary: 'Replaces copper SerDes with silicon photonics to eradicate thermal throttling in clusters.',
      },
    ],
  },

  // RIGHT COLUMN (3 Files)
  {
    id: 'file-04',
    title: 'Global Compute & Mesh',
    fileTag: 'FILE // 04',
    categoryName: 'Compute',
    accent: 'violet',
    column: 'right',
    row: 1,
    items: [
      {
        id: 'comp-1',
        headline: 'Decentralized GPU mesh networks surpass 620k active nodes',
        category: 'Mesh',
        source: 'Compute Pulse',
        timestamp: 'Just now',
        readTime: '2 min',
        summary: 'Cryptographically verified spot compute drives distributed training costs down by 64%.',
      },
      {
        id: 'comp-2',
        headline: 'Hierarchical supervisor reasoning loops deployed for enterprise ops',
        category: 'Scale',
        source: 'Silicon Herald',
        timestamp: '22m',
        readTime: '3 min',
        summary: 'Orchestrators dynamically provision transient micro-models for instant root-cause analysis.',
      },
    ],
  },
  {
    id: 'file-05',
    title: 'Dev & Build Ecosystem',
    fileTag: 'FILE // 05',
    categoryName: 'Tooling',
    accent: 'amber',
    column: 'right',
    row: 2,
    items: [
      {
        id: 'dev-1',
        headline: 'React 19 Server Actions ecosystem reaches universal enterprise parity',
        category: 'React',
        source: 'Frontend Dev',
        timestamp: 'Just now',
        readTime: '3 min',
        summary: 'Streamlined form mutations and zero-bundle server logic replace legacy client fetch pipelines.',
      },
      {
        id: 'dev-2',
        headline: 'Vite 6 architecture introduces universal runtime sandboxing & proxies',
        category: 'Tooling',
        source: 'DevOps Digest',
        timestamp: '50m',
        readTime: '2 min',
        summary: 'Eliminates container cold starts with native isolated WebAssembly development environments.',
      },
    ],
  },
  {
    id: 'file-06',
    title: 'Cyber & Post-Quantum',
    fileTag: 'FILE // 06',
    categoryName: 'Security',
    accent: 'rose',
    column: 'right',
    row: 3,
    items: [
      {
        id: 'sec-1',
        headline: 'Kyber post-quantum cryptographic primitives ratified across tier-1 CDNs',
        category: 'Quantum',
        source: 'Cyber Intel',
        timestamp: 'Just now',
        readTime: '2 min',
        summary: 'Global internet edge infrastructure establishes quantum-resistant TLS key exchange compatibility.',
      },
      {
        id: 'sec-2',
        headline: 'Deterministic eBPF microsegmentation enforces compile-time security',
        category: 'Zero-Trust',
        source: 'SecOps Wire',
        timestamp: '1h',
        readTime: '2 min',
        summary: 'Kernel-level behavioral verification dynamically isolates ephemeral AI agent cluster containers.',
      },
    ],
  },
];

const ACCENT_COLORS = {
  lime: '#D8FF65',
  emerald: '#50FA7B',
  cyan: '#8FF3DF',
  violet: '#BD93F9',
  amber: '#FFB86C',
  rose: '#FF79C6',
};

// 60-second polling cadence
const POLL_INTERVAL_SECONDS = 60;

export const AmbientNewsFeeds: React.FC<AmbientNewsFeedsProps> = ({
  isActive,
  onSelectHeadline,
  onActivateApp,
  onToast,
}) => {
  const [files, setFiles] = useState<NewsFile[]>(INITIAL_SIX_FILES);
  const [syncingFiles, setSyncingFiles] = useState<Record<string, boolean>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live');
  const [secondsUntilNextPoll, setSecondsUntilNextPoll] = useState<number>(POLL_INTERVAL_SECONDS);

  const isFetchingRef = useRef(false);
  const filesRef = useRef(files);
  filesRef.current = files;
  const onToastRef = useRef(onToast);
  onToastRef.current = onToast;

  // Fetch live news updates from the API endpoint
  const fetchLiveNews = useCallback(
    async (targetFileId?: string, isAutoPoll: boolean = false) => {
      if (isFetchingRef.current && !targetFileId) return;

      if (targetFileId) {
        setSyncingFiles((prev) => ({ ...prev, [targetFileId]: true }));
      } else {
        setIsSyncingAll(true);
        isFetchingRef.current = true;
      }

      try {
        const res = await fetch('/api/news/live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: targetFileId }),
        });

        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }

        const data = await res.json();
        if (data.feeds && Array.isArray(data.feeds) && data.feeds.length > 0) {
          setFiles((prevFiles) =>
            prevFiles.map((file) => {
              const updated = data.feeds.find(
                (f: { folderId: string }) =>
                  f.folderId === file.id ||
                  (file.id === 'file-01' && f.folderId === 'folder-top-left') ||
                  (file.id === 'file-02' && f.folderId === 'folder-bottom-left') ||
                  (file.id === 'file-04' && f.folderId === 'folder-top-right') ||
                  (file.id === 'file-05' && f.folderId === 'folder-bottom-right')
              );
              if (updated && Array.isArray(updated.items) && updated.items.length > 0) {
                return {
                  ...file,
                  items: updated.items,
                };
              }
              return file;
            })
          );

          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSyncTime(timeStr);
          setSecondsUntilNextPoll(POLL_INTERVAL_SECONDS);

          if (onToastRef.current && !isAutoPoll) {
            const targetTitle = filesRef.current.find((f) => f.id === targetFileId)?.title || 'file';
            onToastRef.current(
              targetFileId
                ? `Live update received for ${targetTitle}`
                : 'All 6 news files refreshed via live polling'
            );
          }
        }
      } catch (err: unknown) {
        // Fallback dynamic timestamp updates so data feels constantly fresh
        setFiles((prev) =>
          prev.map((f) => {
            if (!targetFileId || f.id === targetFileId) {
              return {
                ...f,
                items: f.items.map((item, idx) => ({
                  ...item,
                  timestamp: idx === 0 ? 'Just now' : `${(idx + 1) * 5}m`,
                })),
              };
            }
            return f;
          })
        );
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
        setSecondsUntilNextPoll(POLL_INTERVAL_SECONDS);
      } finally {
        if (targetFileId) {
          setSyncingFiles((prev) => ({ ...prev, [targetFileId]: false }));
        } else {
          setIsSyncingAll(false);
          setIsLoadingInitial(false);
          isFetchingRef.current = false;
        }
      }
    },
    []
  );

  const fetchLiveNewsRef = useRef(fetchLiveNews);
  fetchLiveNewsRef.current = fetchLiveNews;

  // 1. Initial skeleton loading simulation & first content fetch on mount ONLY
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      fetchLiveNewsRef.current(undefined, true);
    }, 700);

    return () => clearTimeout(initialTimer);
  }, []);

  // 2. 60-Second Polling Mechanism + 1s countdown ticker
  useEffect(() => {
    // 1-second interval to drive the 60s countdown ticker & trigger polling
    const pollInterval = setInterval(() => {
      // If the app is active or user switched tabs, we still track or pause
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }

      setSecondsUntilNextPoll((prev) => {
        if (prev <= 1) {
          // Time to poll!
          fetchLiveNewsRef.current(undefined, true);
          return POLL_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(pollInterval);
  }, []);

  const leftFiles = files.filter((f) => f.column === 'left');
  const rightFiles = files.filter((f) => f.column === 'right');

  // Skeleton Loader for a single file card
  const renderSkeletonCard = (file: NewsFile) => {
    const accentColor = ACCENT_COLORS[file.accent] || '#D8FF65';

    return (
      <div
        key={`skeleton-${file.id}`}
        className="w-[200px] xs:w-[215px] sm:w-[225px] lg:w-[240px] select-none"
      >
        {/* Skeleton Tab */}
        <div className="flex items-center justify-between">
          <div
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-t-[10px] bg-[#0E1114]/90 border-t border-l border-r border-[#202629] backdrop-blur-md text-[8.5px] font-mono tracking-wider"
            style={{ color: accentColor }}
          >
            <Newspaper className="w-2.5 h-2.5 opacity-40 animate-pulse" />
            <div className="h-2 w-12 bg-white/10 rounded animate-pulse" />
            <span className="text-[#353F44]">/</span>
            <div className="h-2 w-8 bg-white/5 rounded animate-pulse" />
          </div>

          <div className="flex items-center gap-1 pr-1.5">
            <div className="w-2 h-2 rounded-full bg-white/10 animate-ping" />
            <span className="text-[7.5px] font-mono text-[#555F61]">FETCHING</span>
          </div>
        </div>

        {/* Skeleton Card Body */}
        <div className="bg-[#080A0C]/90 backdrop-blur-md border border-[#202629] rounded-b-[14px] rounded-tr-[14px] p-2 sm:p-2.5 shadow-xl shadow-black/80 relative overflow-hidden">
          {/* Subtle Shimmer Ray */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />

          {/* Skeleton Header */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#181D20]">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
              <div className="h-2.5 w-24 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-2 w-8 bg-white/5 rounded animate-pulse" />
          </div>

          {/* Skeleton Items (2 items) */}
          <div className="space-y-1.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-1.5 rounded-[8px] bg-[#0E1114]/60 border border-[#181D20] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-2 w-10 bg-white/10 rounded animate-pulse" />
                  <div className="h-2 w-6 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-2 w-3/4 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Footer */}
          <div className="mt-1.5 pt-1 border-t border-[#14181B] flex items-center justify-between">
            <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-6 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  };

  // Loaded File Card
  const renderFileCard = (file: NewsFile) => {
    // If initially loading or currently syncing this individual file, show skeleton
    if (isLoadingInitial || syncingFiles[file.id]) {
      return renderSkeletonCard(file);
    }

    const accentColor = ACCENT_COLORS[file.accent] || '#D8FF65';
    const isFileSyncing = syncingFiles[file.id] || isSyncingAll;

    return (
      <div
        key={file.id}
        onClick={onActivateApp}
        className="w-[200px] xs:w-[215px] sm:w-[225px] lg:w-[240px] select-none cursor-pointer group transition-all duration-300"
      >
        {/* Top Folder File Tab */}
        <div className="flex items-center justify-between">
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-t-[10px] bg-[#0E1114]/90 border-t border-l border-r border-[#202629] backdrop-blur-md text-[8.5px] font-mono tracking-wider transition-colors duration-300 group-hover:border-[#384247]"
            style={{ color: accentColor }}
          >
            <Newspaper className="w-2.5 h-2.5" />
            <span className="font-semibold uppercase">{file.fileTag}</span>
            <span className="text-[#555F61]">/</span>
            <span className="text-[#9CA4A5]">{file.categoryName}</span>
          </div>

          {/* Quick Sync Button */}
          <div className="flex items-center gap-1 pr-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fetchLiveNews(file.id);
              }}
              title={`Fetch live updates for ${file.title}`}
              className="p-0.5 rounded hover:bg-[#1A2024] text-[#555F61] hover:text-[#D8FF65] transition-colors"
            >
              <RefreshCw className={`w-2 h-2 ${isFileSyncing ? 'animate-spin text-[#D8FF65]' : ''}`} />
            </button>
            <div className="hidden xs:flex items-center gap-0.5 text-[8px] text-[#555F61] font-mono">
              <span className="w-1 h-1 rounded-full bg-[#353F44] group-hover:bg-[#D8FF65] transition-colors" />
              <span>LIVE</span>
            </div>
          </div>
        </div>

        {/* File Main Container */}
        <div
          className="bg-[#080A0C]/90 backdrop-blur-md border border-[#202629] rounded-b-[14px] rounded-tr-[14px] p-2 sm:p-2.5 shadow-xl shadow-black/80 transition-all duration-300 group-hover:border-[#384247] group-hover:shadow-[0_0_24px_rgba(0,0,0,0.8)] group-hover:scale-[1.015]"
          style={{
            boxShadow: `0 8px 24px -8px rgba(0,0,0,0.8)`,
          }}
        >
          {/* File Header Row */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#181D20]">
            <div className="flex items-center gap-1">
              <span
                className={`w-1 h-1 rounded-full ${isFileSyncing ? 'bg-[#D8FF65] animate-spin' : 'animate-ping'}`}
                style={{ backgroundColor: accentColor }}
              />
              <h4 className="text-[10px] font-bold tracking-tight text-[#F1F4F3] truncate max-w-[130px]">
                {file.title}
              </h4>
            </div>

            <span className="text-[8px] text-[#778184] font-mono flex items-center gap-0.5 shrink-0">
              <Clock className="w-2 h-2" /> {isFileSyncing ? 'Syncing...' : 'Live'}
            </span>
          </div>

          {/* Headlines (Clicking feeds LLM) */}
          <div className="space-y-1.5">
            {file.items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHeadline(item);
                }}
                title="Feed this live news update directly into Island LLM"
                className="group/item p-1.5 rounded-[8px] bg-[#0E1114]/70 hover:bg-[#14181C] border border-[#1A1F22] hover:border-[#2C3539] transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className="px-1 py-0.2 rounded text-[7.5px] font-mono font-medium border"
                    style={{
                      color: accentColor,
                      borderColor: `${accentColor}33`,
                      backgroundColor: `${accentColor}11`,
                    }}
                  >
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1 text-[8px] text-[#555F61] font-mono">
                    <span>{item.timestamp}</span>
                    <ArrowUpRight className="w-2.5 h-2.5 text-[#555F61] group-hover/item:text-[#D8FF65] transition-colors" />
                  </div>
                </div>

                <p className="text-[9px] font-medium text-[#C5CBC9] group-hover/item:text-[#FFFFFF] leading-snug line-clamp-2">
                  {item.headline}
                </p>
              </div>
            ))}
          </div>

          {/* Footer Notice */}
          <div className="mt-1.5 pt-1 border-t border-[#14181B] flex items-center justify-between text-[8px] text-[#778184]">
            <span className="group-hover:text-[#D8FF65] transition-colors flex items-center gap-1">
              <Sparkles className="w-2 h-2 text-[#D8FF65]" /> Click to feed LLM
            </span>
            <span className="font-mono text-[8px] text-[#555F61]">
              +{file.items.length - 2}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-30 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isActive ? 'opacity-0 pointer-events-none blur-sm' : 'opacity-100'
      }`}
      aria-hidden={isActive}
    >
      {/* Top Ambient Live Radar Bar with 60-Second Polling Indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0D0F]/85 backdrop-blur-md border border-[#202629] text-[10px] text-[#778184] shadow-lg pointer-events-auto">
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D8FF65] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D8FF65]"></span>
        </span>
        <span className="font-mono text-[#D8FF65] flex items-center gap-1">
          <Layers className="w-3 h-3" /> 6 LIVE FILES
        </span>
        <span className="text-[#353F44]">•</span>
        <span className="text-[#9CA4A5]">Auto-poll: 60s</span>
        <span className="text-[#353F44]">•</span>
        <span className="font-mono text-[#778184] flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-[#555F61]" />
          <span>{isSyncingAll ? 'Polling...' : `Next: ${secondsUntilNextPoll}s`}</span>
        </span>
        <span className="text-[#353F44]">•</span>
        <span className="font-mono text-[9px] text-[#555F61]">Last: {lastSyncTime}</span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fetchLiveNews(undefined, false);
          }}
          disabled={isSyncingAll}
          className="ml-1 p-1 rounded hover:bg-[#181D20] text-[#778184] hover:text-[#D8FF65] transition-colors flex items-center gap-1 active:scale-95"
          title="Manually trigger live news update for all 6 files"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${isSyncingAll ? 'animate-spin text-[#D8FF65]' : ''}`} />
          <span className="text-[9px] font-mono">Sync</span>
        </button>
      </div>

      {/* LEFT COLUMN: 3 FILES STACKED VERTICALLY */}
      <div
        className={`fixed left-2 xs:left-3 sm:left-5 lg:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 sm:gap-3 pointer-events-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar py-2 ${
          isActive ? '-translate-x-16 opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        {leftFiles.map(renderFileCard)}
      </div>

      {/* RIGHT COLUMN: 3 FILES STACKED VERTICALLY */}
      <div
        className={`fixed right-2 xs:right-3 sm:right-5 lg:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 sm:gap-3 pointer-events-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar py-2 ${
          isActive ? 'translate-x-16 opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        {rightFiles.map(renderFileCard)}
      </div>
    </div>
  );
};
