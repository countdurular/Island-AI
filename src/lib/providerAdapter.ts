import { AttachedContext, CapabilityId, ModelId, ProviderSettings } from '../types';
import { AIProvider, ProviderRequest, ProviderResponse } from './providers/base';
import { GeminiServerProvider } from './providers/geminiProvider';
import { OpenAICompatibleProvider } from './providers/openaiProvider';
import { SimulationProvider } from './providers/simulationProvider';
import { ModelRouter, ModelRouteDecision } from './modelRouter';

export class ProviderAdapter {
  private geminiProvider = new GeminiServerProvider();
  private openaiProvider = new OpenAICompatibleProvider();
  private simulationProvider = new SimulationProvider();
  private modelRouter = new ModelRouter();

  public async execute(
    instruction: string,
    capability: CapabilityId,
    selectedModel: ModelId,
    context: AttachedContext[],
    settings: ProviderSettings
  ): Promise<ProviderResponse & { routeDecision: ModelRouteDecision }> {
    const routeDecision = this.modelRouter.route(selectedModel, capability);

    const request: ProviderRequest = {
      instruction,
      capability,
      modelName: routeDecision.effectiveModelName,
      context,
      settings,
    };

    // 1. If user explicitly configured OpenAI compatible key and chosen model is GPT
    if (routeDecision.resolvedProvider === 'openai-compatible' && settings.openaiApiKey) {
      try {
        const res = await this.openaiProvider.generate(request);
        return { ...res, routeDecision };
      } catch (err: unknown) {
        console.warn('OpenAI provider failed, falling back to simulator:', err);
      }
    }

    // 2. If provider is Gemini (or auto-routed to Gemini)
    if (routeDecision.resolvedProvider === 'gemini') {
      try {
        const res = await this.geminiProvider.generate(request);
        return { ...res, routeDecision };
      } catch (err: unknown) {
        console.warn('Server Gemini call unavailable, using simulation engine:', err);
      }
    }

    // 3. Fallback to simulation engine with transparent simulation banner
    const simRes = await this.simulationProvider.generate(request);
    return {
      ...simRes,
      model: `${routeDecision.effectiveModelName} (Simulated)`,
      routeDecision,
    };
  }
}

export const defaultProviderAdapter = new ProviderAdapter();
