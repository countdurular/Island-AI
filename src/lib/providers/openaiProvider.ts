import { AIProvider, ProviderRequest, ProviderResponse } from './base';

export class OpenAICompatibleProvider implements AIProvider {
  id = 'openai-compatible';
  name = 'OpenAI Compatible Endpoint';

  async generate(req: ProviderRequest): Promise<ProviderResponse> {
    const baseUrl = req.settings.openaiBaseUrl?.trim() || 'https://api.openai.com/v1';
    const apiKey = req.settings.openaiApiKey?.trim();

    if (!apiKey) {
      throw new Error('API key not configured in Island Settings');
    }

    const endpoint = baseUrl.endsWith('/chat/completions') 
      ? baseUrl 
      : `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const model = req.settings.openaiModel || req.modelName || 'gpt-4o';

    const messages: Array<{ role: string; content: string }> = [];
    if (req.settings.systemInstruction) {
      messages.push({ role: 'system', content: req.settings.systemInstruction });
    }

    if (req.context && req.context.length > 0) {
      const contextText = req.context
        .map(c => `[Context File: ${c.name}]\n${c.content}`)
        .join('\n\n');
      messages.push({ role: 'system', content: `Attached Reference Documents:\n${contextText}` });
    }

    messages.push({ role: 'user', content: req.instruction });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      model,
      provider: 'OpenAI Compatible Gateway',
      isSimulated: false,
    };
  }
}
