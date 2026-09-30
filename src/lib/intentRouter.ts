import { CapabilityId, IntentResult, AttachedContext, ModelId } from '../types';

interface RouteRule {
  capability: CapabilityId;
  patterns: RegExp[];
  keywords: string[];
  suggestedModel: ModelId;
  weight: number;
}

export class IntentRouter {
  private rules: RouteRule[] = [
    {
      capability: 'build',
      patterns: [
        /^(build|create|generate|scaffold|design)\s+(me\s+)?(a|an|the)?/i,
        /landing page|full-stack|saas|web app|frontend|interface|wireframe|component/i,
        /build\s+(me\s+)?an?\s+(ai-powered|modern|interactive)/i,
      ],
      keywords: ['build', 'scaffold', 'mockup', 'landing page', 'saas', 'crm', 'dashboard', 'prototype', 'figma'],
      suggestedModel: 'auto',
      weight: 1.5,
    },
    {
      capability: 'code',
      patterns: [
        /^(debug|fix|refactor|optimize|write code|implement)\b/i,
        /stack trace|syntax error|null pointer|typescript error|react hook|function\s*\(/i,
        /unit test|regex|api route|sql query|algorithm|pull request/i,
      ],
      keywords: ['debug', 'code', 'refactor', 'function', 'syntax', 'compile', 'typescript', 'python', 'bug', 'exception'],
      suggestedModel: 'deepseek',
      weight: 1.4,
    },
    {
      capability: 'research',
      patterns: [
        /^(research|investigate|explore|find out about|gather info on)\b/i,
        /market\s+(size|share|analysis|outlook|overview)/i,
        /competitor\s+(analysis|landscape)|industry report|trends in\b/i,
        /compare\s+(these|the|different|leading)\s+/i,
      ],
      keywords: ['research', 'market', 'competitors', 'industry', 'sources', 'citations', 'trends', 'landscape', 'statistics'],
      suggestedModel: 'claude',
      weight: 1.3,
    },
    {
      capability: 'analyze',
      patterns: [
        /^(analyze|examine|inspect|extract|audit|evaluate)\b/i,
        /sentiment analysis|summarize this document|data distribution|break down this (pdf|csv|sheet)/i,
        /financial statement|balance sheet|data patterns/i,
      ],
      keywords: ['analyze', 'pdf', 'csv', 'dataset', 'document', 'metrics', 'extract', 'audit', 'summary'],
      suggestedModel: 'gemini',
      weight: 1.3,
    },
    {
      capability: 'automate',
      patterns: [
        /^(automate|trigger|schedule|create a workflow|when.*then|monitor)\b/i,
        /webhook|cron job|zapier|notification alert|event listener|pipeline/i,
        /monitor\s+this\s+(website|page|price|api)\s+and\s+notify/i,
      ],
      keywords: ['automate', 'workflow', 'trigger', 'condition', 'action', 'monitor', 'cron', 'webhook', 'schedule', 'notify'],
      suggestedModel: 'gpt',
      weight: 1.4,
    },
    {
      capability: 'agents',
      patterns: [
        /^(agent|autonomous|delegate|assign to agent|multi-step task)\b/i,
        /spawn an? agent|sub-agent|worker pool|background worker/i,
      ],
      keywords: ['agent', 'autonomous', 'delegation', 'swarm', 'crew', 'multi-step', 'worker'],
      suggestedModel: 'gpt',
      weight: 1.2,
    },
    {
      capability: 'voice',
      patterns: [
        /^(voice mode|talk to me|speak with me|listen to|dictate|audio conversation)\b/i,
        /realtime audio|speech-to-text/i,
      ],
      keywords: ['voice', 'speak', 'audio', 'microphone', 'listen', 'talk', 'conversation'],
      suggestedModel: 'gemini',
      weight: 1.2,
    },
    {
      capability: 'ask',
      patterns: [
        /^(what|why|how|who|where|when|can you|explain|tell me)\b/i,
        /difference between|pros and cons|is it possible/i,
      ],
      keywords: ['explain', 'what', 'why', 'how', 'concept', 'question', 'advice', 'help'],
      suggestedModel: 'auto',
      weight: 1.0,
    },
  ];

  public infer(prompt: string, context: AttachedContext[] = []): IntentResult {
    const cleanPrompt = prompt.trim();

    // If context is attached with docs/images and prompt asks to inspect or is short, prioritize analyze
    if (context.length > 0 && (cleanPrompt.length === 0 || /what|explain|summarize|extract|analyze|show/i.test(cleanPrompt))) {
      return {
        capability: 'analyze',
        confidence: 0.92,
        reason: `Attached file context detected (${context.length} document${context.length > 1 ? 's' : ''})`,
        suggestedModel: 'gemini',
      };
    }

    if (!cleanPrompt) {
      return {
        capability: 'ask',
        confidence: 0.5,
        reason: 'Empty instruction defaulted to universal reasoning',
        suggestedModel: 'auto',
      };
    }

    const scores: Record<CapabilityId, { score: number; reason: string; suggestedModel: ModelId }> = {
      ask: { score: 0.3, reason: 'General reasoning query', suggestedModel: 'auto' },
      build: { score: 0, reason: '', suggestedModel: 'auto' },
      analyze: { score: 0, reason: '', suggestedModel: 'gemini' },
      research: { score: 0, reason: '', suggestedModel: 'claude' },
      code: { score: 0, reason: '', suggestedModel: 'deepseek' },
      voice: { score: 0, reason: '', suggestedModel: 'gemini' },
      automate: { score: 0, reason: '', suggestedModel: 'gpt' },
      agents: { score: 0, reason: '', suggestedModel: 'gpt' },
    };

    const lower = cleanPrompt.toLowerCase();
    const words = lower.split(/\s+/);

    for (const rule of this.rules) {
      let matched = false;

      // Regex matches
      for (const pattern of rule.patterns) {
        if (pattern.test(lower)) {
          scores[rule.capability].score += 2.0 * rule.weight;
          scores[rule.capability].reason = `Pattern match: "${pattern.source.replace(/\\b|\\s\+|[\^$]/g, ' ')}"`;
          matched = true;
          break;
        }
      }

      // Keyword occurrences
      let keywordHits = 0;
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) {
          keywordHits++;
        }
      }

      if (keywordHits > 0) {
        scores[rule.capability].score += (keywordHits * 0.4) * rule.weight;
        if (!scores[rule.capability].reason) {
          scores[rule.capability].reason = `Domain keywords identified (${rule.keywords.filter(k => lower.includes(k)).join(', ')})`;
        }
      }
    }

    // Find the capability with the highest score
    let bestCap: CapabilityId = 'ask';
    let highestScore = 0;

    for (const [cap, data] of Object.entries(scores) as [CapabilityId, { score: number; reason: string; suggestedModel: ModelId }][]) {
      if (data.score > highestScore) {
        highestScore = data.score;
        bestCap = cap;
      }
    }

    const confidence = Math.min(0.99, Math.max(0.45, highestScore / 3.0));

    return {
      capability: bestCap,
      confidence: Number(confidence.toFixed(2)),
      reason: scores[bestCap].reason || 'Universal intent resolved',
      suggestedModel: scores[bestCap].suggestedModel,
    };
  }
}

export const defaultIntentRouter = new IntentRouter();
