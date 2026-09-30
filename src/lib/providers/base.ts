import { AttachedContext, CapabilityId, ProviderSettings } from '../../types';

export interface ProviderRequest {
  instruction: string;
  capability: CapabilityId;
  modelName: string;
  context: AttachedContext[];
  settings: ProviderSettings;
  systemInstruction?: string;
  streamCallback?: (chunk: string) => void;
}

export interface ProviderResponse {
  content: string;
  model: string;
  provider: string;
  isSimulated: boolean;
  metadata?: {
    codeSnippets?: { language: string; code: string; filename?: string }[];
    workflowNodes?: { id: string; type: 'trigger' | 'condition' | 'action'; title: string; desc: string }[];
    researchSources?: { title: string; domain: string; snippet: string }[];
    agentTasks?: { title: string; status: 'pending' | 'in_progress' | 'completed' }[];
  };
}

export interface AIProvider {
  id: string;
  name: string;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}
