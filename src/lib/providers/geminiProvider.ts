import { AIProvider, ProviderRequest, ProviderResponse } from './base';

export class GeminiServerProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini (Native Engine)';

  async generate(req: ProviderRequest): Promise<ProviderResponse> {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: req.instruction,
        capability: req.capability,
        model: req.modelName.includes('gemini') ? req.modelName.split(' ')[0] : 'gemini-3.8-flash',
        systemInstruction: req.systemInstruction || req.settings.systemInstruction,
        attachedContext: req.context,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${response.status}`);
    }

    const data = await response.json();
    if (data.simulated) {
      throw new Error('No server API key found');
    }

    return {
      content: data.text,
      model: data.model || 'gemini-3.8-flash',
      provider: 'Google Gemini',
      isSimulated: false,
    };
  }
}
