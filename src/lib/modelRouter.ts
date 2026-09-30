import { CapabilityId, ModelId } from '../types';

export interface ModelRouteDecision {
  requestedModel: ModelId;
  resolvedProvider: 'gemini' | 'openai-compatible' | 'anthropic' | 'deepseek' | 'local';
  effectiveModelName: string;
  rationale: string;
}

export class ModelRouter {
  public route(selectedModel: ModelId, capability: CapabilityId): ModelRouteDecision {
    if (selectedModel !== 'auto') {
      switch (selectedModel) {
        case 'gemini':
          return {
            requestedModel: 'gemini',
            resolvedProvider: 'gemini',
            effectiveModelName: 'gemini-3.8-flash',
            rationale: 'User pinned to Google Gemini Native Engine (High-throughput multimodal)',
          };
        case 'gpt':
          return {
            requestedModel: 'gpt',
            resolvedProvider: 'openai-compatible',
            effectiveModelName: 'gpt-4o',
            rationale: 'User pinned to OpenAI GPT-4o (Autonomous reasoning & tool orchestration)',
          };
        case 'claude':
          return {
            requestedModel: 'claude',
            resolvedProvider: 'anthropic',
            effectiveModelName: 'claude-3-5-sonnet',
            rationale: 'User pinned to Anthropic Claude 3.5 (Nuanced prose, research & analysis)',
          };
        case 'deepseek':
          return {
            requestedModel: 'deepseek',
            resolvedProvider: 'deepseek',
            effectiveModelName: 'deepseek-r1',
            rationale: 'User pinned to DeepSeek R1 (Deep technical reasoning & code synthesis)',
          };
        case 'local':
          return {
            requestedModel: 'local',
            resolvedProvider: 'local',
            effectiveModelName: 'llama-3.3-70b',
            rationale: 'User pinned to Local / Ollama self-hosted runtime',
          };
      }
    }

    // Auto routing based on capability
    switch (capability) {
      case 'code':
      case 'build':
        return {
          requestedModel: 'auto',
          resolvedProvider: 'gemini',
          effectiveModelName: 'gemini-3.8-flash',
          rationale: 'Auto-routed: High-speed code execution and structured scaffolding',
        };
      case 'research':
        return {
          requestedModel: 'auto',
          resolvedProvider: 'anthropic',
          effectiveModelName: 'claude-3-5-sonnet (Auto)',
          rationale: 'Auto-routed: Deep synthetic literature review and objective comparative analysis',
        };
      case 'analyze':
      case 'voice':
        return {
          requestedModel: 'auto',
          resolvedProvider: 'gemini',
          effectiveModelName: 'gemini-3.8-flash (Auto)',
          rationale: 'Auto-routed: Multimodal token ingestion and live low-latency processing',
        };
      case 'automate':
      case 'agents':
        return {
          requestedModel: 'auto',
          resolvedProvider: 'openai-compatible',
          effectiveModelName: 'gpt-4o (Auto)',
          rationale: 'Auto-routed: Function calling graph resolution and multi-turn agency',
        };
      case 'ask':
      default:
        return {
          requestedModel: 'auto',
          resolvedProvider: 'gemini',
          effectiveModelName: 'gemini-3.8-flash (Auto)',
          rationale: 'Auto-routed: Optimal balance of general intelligence and instantaneous response',
        };
    }
  }
}

export const defaultModelRouter = new ModelRouter();
