import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Health and provider status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Gemini generation endpoint
app.post('/api/gemini/generate', async (req, res) => {
  const { prompt, systemInstruction, model, attachedContext } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Using client fallback simulator.',
      simulated: true
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const modelName = model || 'gemini-3.8-flash';

    let promptContent = prompt;
    if (attachedContext && Array.isArray(attachedContext) && attachedContext.length > 0) {
      const contextSummaries = attachedContext
        .map((ctx: { name: string; content?: string }) => `--- FILE CONTEXT: ${ctx.name} ---\n${ctx.content || ''}`)
        .join('\n\n');
      promptContent = `${contextSummaries}\n\nUSER INSTRUCTION:\n${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptContent,
      config: {
        systemInstruction: systemInstruction || 'You are ISLAND AI, an advanced AI operating surface and executive intelligence wrapper. Provide precise, highly structured, expert responses without conversational fluff or filler.',
      },
    });

    const text = response.text || '';
    return res.json({ text, model: modelName, simulated: false });
  } catch (err: unknown) {
    console.error('Gemini generation error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown generation error';
    return res.status(500).json({ error: errorMessage });
  }
});

// Live News feeds endpoint powered by Gemini 3.8 Flash
app.post('/api/news/live', async (req, res) => {
  const { folderId } = req.body || {};

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      simulated: true,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const categoryScope = folderId
      ? `Generate 3 fresh, high-impact news updates for the category with ID "${folderId}".`
      : `Generate 2 fresh, high-impact tech news updates for each of these 6 categories (two columns of three files):
         - "file-01": AI Kernel & Reasoning (autonomous coding agents, deep reasoning chains, multimodal models)
         - "file-02": Research Dispatches (arXiv discoveries, sparse attention, lifelong learning memory)
         - "file-03": Silicon & WebGPU (edge tensor cores, WebGPU neural primitives, ultra-low latency inference)
         - "file-04": Global Compute & Mesh (decentralized GPU networks, cluster Raft consensus, scaling laws)
         - "file-05": Dev Ecosystem (React 19 Server Actions, TypeScript state invariants, Vite universal runtimes)
         - "file-06": Cyber & Post-Quantum (lattice cryptography, quantum-resistant TLS, zero-trust infrastructure)`;

    const prompt = `You are a real-time technology news radar and live dispatch feed.
${categoryScope}

Requirements:
- Realistic, high-signal, technical headlines that appeal to software architects and AI researchers.
- Short timestamps like "Just now", "4m", "12m", "25m".
- Source names like "ArXiv Wire", "Kernel Dispatch", "Silicon Herald", "Compute Pulse", "Dev Digest", "Cyber Intel".
- Clear 1-2 sentence technical summary explaining the breakthrough.

Respond ONLY with valid JSON in this schema:
{
  "feeds": [
    {
      "folderId": "string (e.g. file-01, file-02, file-03, file-04, file-05, file-06)",
      "items": [
        {
          "id": "string",
          "headline": "string",
          "category": "string",
          "source": "string",
          "timestamp": "string",
          "readTime": "string",
          "summary": "string"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an elite, real-time intelligence feed generator. Return valid JSON only.',
      },
    });

    const raw = (response.text || '{}').trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      data = JSON.parse(cleaned);
    }

    return res.json({ success: true, feeds: data.feeds || [], model: 'gemini-3.8-flash' });
  } catch (err: unknown) {
    console.warn('Gemini 3.8 Flash temporary spike/503 encountered, serving resilient dynamic live feed:', err);
    
    // Resilient live fallback with rotating intelligence items
    const nowMinutes = new Date().getMinutes();
    const fallbackPool: Record<string, Array<{ headline: string; category: string; source: string; summary: string }>> = {
      'file-01': [
        {
          headline: 'Multi-Agent Consensus protocols achieve 95.8% accuracy on SWE-Bench',
          category: 'Agents',
          source: 'AI Research Wire',
          summary: 'Asynchronous debate loops and tool-verifiers prevent hallucination in multi-file refactoring tasks.',
        },
        {
          headline: 'Speculative draft verification reduces inference latency below 11ms',
          category: 'Reasoning',
          source: 'Kernel Dispatch',
          summary: 'Parallelized token draft heads allow real-time voice streaming with sub-perceptual lag.',
        },
      ],
      'file-02': [
        {
          headline: 'Latent space diffusion mechanisms eliminate sequential catastrophic forgetting',
          category: 'DeepMind',
          source: 'ArXiv Wire',
          summary: 'Preserves foundational model weights while assimilating streaming domain knowledge in real time.',
        },
        {
          headline: 'Token-pruned dynamic sparse attention cuts KV-cache overhead by 74%',
          category: 'Stanford AI',
          source: 'ML Systems',
          summary: 'Enables 10-million-token active context windows on standard consumer hardware setups.',
        },
      ],
      'file-03': [
        {
          headline: 'Native WebGPU tensor cores deployed to production Chromium runtimes',
          category: 'WebGPU',
          source: 'Standards Weekly',
          summary: 'Unlocks zero-installation client-side LLM inference at 85 tokens/sec directly in the browser.',
        },
        {
          headline: 'Ultra-low latency silicon interconnects achieve sub-5 microsecond memory access',
          category: 'Silicon',
          source: 'Hardware Pulse',
          summary: 'Co-packaged optics overcome copper SerDes thermal throttles in dense compute clusters.',
        },
      ],
      'file-04': [
        {
          headline: 'Decentralized compute mesh surpasses 620,000 active H100/A100 instances',
          category: 'Mesh',
          source: 'Compute Pulse',
          summary: 'Cryptographically verified spot instances drive distributed training costs down by 64%.',
        },
        {
          headline: 'Sub-second hierarchical reasoning loops orchestrated for enterprise ops',
          category: 'Scale',
          source: 'Silicon Herald',
          summary: 'Supervisor orchestrators dynamically provision transient micro-models for instant root-cause analysis.',
        },
      ],
      'file-05': [
        {
          headline: 'React 19 Server Actions ecosystem reaches full enterprise parity and adoption',
          category: 'React',
          source: 'Frontend Dev',
          summary: 'Streamlined form mutations and zero-bundle server logic replace legacy client fetch architectures.',
        },
        {
          headline: 'Vite 6 architecture introduces universal runtime sandboxing & edge proxies',
          category: 'Tooling',
          source: 'DevOps Digest',
          summary: 'Eliminates container cold-starts with native WebAssembly isolated development runtimes.',
        },
      ],
      'file-06': [
        {
          headline: 'Kyber post-quantum cryptographic primitives ratified across tier-1 CDN egress',
          category: 'Security',
          source: 'Cyber Intel',
          summary: 'Global web infrastructure achieves quantum-resistant key exchange compatibility ahead of schedule.',
        },
        {
          headline: 'Zero-trust microsegmentation automated by compile-time network invariants',
          category: 'Zero-Trust',
          source: 'SecOps Wire',
          summary: 'Deterministic eBPF security policies dynamically enforce isolation across ephemeral agent clusters.',
        },
      ],
    };

    // Backwards compatibility aliases
    fallbackPool['folder-top-left'] = fallbackPool['file-01'];
    fallbackPool['folder-top-right'] = fallbackPool['file-04'];
    fallbackPool['folder-bottom-left'] = fallbackPool['file-02'];
    fallbackPool['folder-bottom-right'] = fallbackPool['file-05'];

    const targetKeys = folderId && fallbackPool[folderId] ? [folderId] : Object.keys(fallbackPool);
    const fallbackFeeds = targetKeys.map((key) => ({
      folderId: key,
      items: (fallbackPool[key] || []).map((item, idx) => ({
        id: `fb-${key}-${idx}-${Date.now()}`,
        headline: item.headline,
        category: item.category,
        source: item.source,
        timestamp: idx === 0 ? 'Just now' : `${((nowMinutes + idx * 7) % 45) + 3}m`,
        readTime: '2 min',
        summary: item.summary,
      })),
    }));

    return res.json({
      success: true,
      feeds: fallbackFeeds,
      model: 'gemini-3.8-flash (Resilient Failover)',
      fallback: true,
    });
  }
});

// Production / Development server setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev mode, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[ISLAND AI] Engine online at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ISLAND AI] Server startup failure:', err);
  process.exit(1);
});
