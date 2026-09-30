import { CapabilityId, RecentCommand } from '../types';

const STORAGE_KEY = 'island_recent_commands_v1';
const RECENT_COMMANDS_EVENT = 'island:recent_commands_updated';

const DEFAULT_RECENT_COMMANDS: RecentCommand[] = [
  {
    id: 'cmd-seed-1',
    query: 'Build a production micro-frontend architecture with React 19',
    capability: 'build',
    model: 'Gemini 3.8 Flash',
    timestamp: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'cmd-seed-2',
    query: 'Analyze latency tradeoffs of streaming KV-cache token pruning',
    capability: 'research',
    model: 'Gemini 3.8 Flash',
    timestamp: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'cmd-seed-3',
    query: 'Write eBPF deterministic packet verification filter in Rust',
    capability: 'code',
    model: 'Claude 3.7 Sonnet',
    timestamp: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'cmd-seed-4',
    query: 'Synthesize global compute spot auction pricing trends',
    capability: 'analyze',
    model: 'GPT-4o',
    timestamp: Date.now() - 1000 * 60 * 240,
  },
];

export function getRecentCommands(): RecentCommand[] {
  if (typeof window === 'undefined') return DEFAULT_RECENT_COMMANDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECENT_COMMANDS));
      return DEFAULT_RECENT_COMMANDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RECENT_COMMANDS;
  } catch (err) {
    console.warn('Failed reading recent commands from localStorage:', err);
    return DEFAULT_RECENT_COMMANDS;
  }
}

export function addRecentCommand(
  query: string,
  capability: CapabilityId = 'ask',
  model?: string
): RecentCommand[] {
  if (!query || !query.trim()) return getRecentCommands();
  const trimmed = query.trim();

  try {
    const existing = getRecentCommands();
    // Filter out identical query to avoid clutter, will re-insert at top
    const filtered = existing.filter(
      (c) => c.query.toLowerCase() !== trimmed.toLowerCase()
    );

    const newCommand: RecentCommand = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      query: trimmed,
      capability,
      model: model || 'Island Engine',
      timestamp: Date.now(),
    };

    const updated = [newCommand, ...filtered].slice(0, 30); // keep up to 30 recent commands
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(RECENT_COMMANDS_EVENT, { detail: updated }));
    }
    return updated;
  } catch (err) {
    console.warn('Failed writing recent command to localStorage:', err);
    return getRecentCommands();
  }
}

export function deleteRecentCommand(id: string): RecentCommand[] {
  try {
    const existing = getRecentCommands();
    const updated = existing.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(RECENT_COMMANDS_EVENT, { detail: updated }));
    }
    return updated;
  } catch (err) {
    console.warn('Failed deleting recent command:', err);
    return getRecentCommands();
  }
}

export function clearRecentCommands(): RecentCommand[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(RECENT_COMMANDS_EVENT, { detail: [] }));
    }
    return [];
  } catch (err) {
    console.warn('Failed clearing recent commands:', err);
    return [];
  }
}

export function subscribeRecentCommands(callback: (commands: RecentCommand[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<RecentCommand[]>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getRecentCommands());
    }
  };

  window.addEventListener(RECENT_COMMANDS_EVENT, handler);
  // Also listen to storage events across tabs
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(RECENT_COMMANDS_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
