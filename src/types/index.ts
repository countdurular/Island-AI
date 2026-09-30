export type CapabilityId = 
  | 'ask' 
  | 'build' 
  | 'analyze' 
  | 'research' 
  | 'code' 
  | 'voice' 
  | 'automate' 
  | 'agents';

export type ModelId = 
  | 'auto' 
  | 'gemini' 
  | 'gpt' 
  | 'claude' 
  | 'deepseek' 
  | 'local';

export type IslandState = 
  | 'ready' 
  | 'thinking' 
  | 'synthesizing' 
  | 'building' 
  | 'executing' 
  | 'listening';

export type WorkspaceMode = 'home' | 'workspace' | 'settings';

export interface AttachedContext {
  id: string;
  name: string;
  size: string;
  type: string;
  content: string;
  preview?: string;
}

export interface IntentResult {
  capability: CapabilityId;
  confidence: number;
  reason: string;
  suggestedModel: ModelId;
  parameters?: Record<string, any>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  capability: CapabilityId;
  model: string;
  timestamp: number;
  isSimulated?: boolean;
  metadata?: {
    codeSnippets?: { language: string; code: string; filename?: string }[];
    workflowNodes?: { id: string; type: 'trigger' | 'condition' | 'action'; title: string; desc: string }[];
    researchSources?: { title: string; domain: string; snippet: string }[];
    agentTasks?: { title: string; status: 'pending' | 'in_progress' | 'completed' }[];
  };
}

export interface ProviderSettings {
  openaiBaseUrl: string;
  openaiApiKey: string;
  openaiModel: string;
  systemInstruction: string;
  localBaseUrl: string;
  localModel: string;
}

export interface WorkspaceSession {
  id: string;
  title: string;
  capability: CapabilityId;
  model: ModelId;
  messages: Message[];
  attachedContext: AttachedContext[];
  createdAt: number;
}

export interface RecentCommand {
  id: string;
  query: string;
  capability: CapabilityId;
  model?: string;
  timestamp: number;
}

export type IslandTheme = 'obsidian' | 'cyber' | 'teal';
