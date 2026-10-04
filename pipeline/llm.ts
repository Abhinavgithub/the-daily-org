// A small client for any OpenAI-compatible chat completions endpoint.
// OpenRouter is the default; nothing here is specific to it except the price check.

import { SITE } from '../src/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  /** Tried in order; the next one is used when a model keeps failing. */
  models: string[];
  /** Draws the illustrations. Unset, none are drawn. */
  imageModel?: string;
  /** The most one run may spend, in US dollars, where the provider reports what each call cost. */
  maxCostUsd?: number;
  minIntervalMs: number;
  maxRetries: number;
  /** Called for every extra call the run had to make, with a one-line explanation. */
  log?: (message: string) => void;
  /** Injectable for tests. */
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

export interface ImageResult {
  bytes: Buffer;
  mime: string;
  model: string;
}

export class LlmError extends Error {
  /** The HTTP status, when the provider refused the request outright. */
  status?: number;
  /** Every model refused this one request as it stands (too long, or blocked), so asking again will not help. */
  refused = false;
}

// Refusals that are about what was sent, not about the key, the account or the model's name.
const ABOUT_THE_REQUEST = new Set([400, 403, 413, 422]);

type Retry = { retryAfterMs: number; reason: string };

interface Reply {
  model?: string;
  choices?: { message?: { content?: string; images?: { image_url?: { url?: string } }[] } }[];
  /** `cost` is in US dollars. OpenRouter reports it; other providers may not. */
  usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number };
  error?: { message?: string; code?: number };
}

export function configFromEnv(overrides: { model?: string } = {}): LlmConfig {
  const models = overrides.model
    ? [overrides.model]
    : (process.env.LLM_MODELS ?? 'inclusionai/ling-3.1-flash,apodex/apodex-1.1-mini:free,openrouter/free')
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
  return {
    baseUrl: (process.env.LLM_BASE_URL ?? 'https://openrouter.ai/api/v1').replace(/\/+$/, ''),
    apiKey: process.env.LLM_API_KEY ?? '',
    models,
    imageModel: process.env.LLM_IMAGE_MODEL?.trim() || undefined,
    maxCostUsd: Number(process.env.LLM_MAX_COST_USD) > 0 ? Number(process.env.LLM_MAX_COST_USD) : undefined,
    minIntervalMs: Number(process.env.LLM_MIN_INTERVAL_MS ?? 3500),
    maxRetries: 2,
  };
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class LlmClient {
  calls = 0;
  /** Extra calls by cause, for example "HTTP 429" or "invalid reply". */
  readonly retries: Record<string, number> = {};
  /** Tokens spent, by the model that answered. */
  readonly usage: Record<string, { input: number; output: number }> = {};
  /** What the run has cost so far in US dollars, as far as the provider has said. */
  cost = 0;
  /** Whether the provider has said what any call cost. A run on a free model is told nought, which is still an answer. */
  costReported = false;
  private lastCallAt = 0;
  private readonly fetchFn: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(readonly config: LlmConfig) {
    this.fetchFn = config.fetch ?? fetch;
    this.sleep = config.sleep ?? defaultSleep;
  }

  /** Why no further call should be made, or null while the run is within its limits. */
  limitReached(maxCalls = Infinity): string | null {
    if (this.calls >= maxCalls) return `the cap of ${maxCalls} model calls was reached`;
    const max = this.config.maxCostUsd;
    if (max !== undefined && this.cost >= max) return `the spending limit of $${max} was reached ($${this.cost.toFixed(4)} spent)`;
    return null;
  }

  /** Count a call that did not produce a usable answer, and say why. */
  noteRetry(cause: string, detail: string): void {
    this.retries[cause] = (this.retries[cause] ?? 0) + 1;
    this.config.log?.(`${cause}: ${detail}`);
  }

  private async throttle(): Promise<void> {
    const wait = this.lastCallAt + this.config.minIntervalMs - Date.now();
    if (wait > 0) await this.sleep(wait);
    this.lastCallAt = Date.now();
  }

  /** One request. A rate limit or a failing provider comes back as something to retry; a refusal throws. */
  private async post(model: string, body: Record<string, unknown>, timeoutMs: number): Promise<Reply | Retry> {
    await this.throttle();
    this.calls++;
    let res: Response;
    try {
      res = await this.fetchFn(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': SITE.name,
        },
        body: JSON.stringify({ model, ...body }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      return { retryAfterMs: 0, reason: `network error: ${(err as Error).message}` };
    }

    if (res.status === 429 || res.status >= 500) {
      const header = Number(res.headers.get('retry-after'));
      return { retryAfterMs: Number.isFinite(header) && header > 0 ? header * 1000 : 0, reason: `HTTP ${res.status}` };
    }
    if (!res.ok) {
      // 400, 401, 402, 404: retrying this model will not help.
      const refusal = new LlmError(`${model}: HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
      refusal.status = res.status;
      throw refusal;
    }

    // A body that stops part-way or is not JSON is the provider failing, and worth another try.
    let reply: Reply;
    try {
      reply = (await res.json()) as Reply;
    } catch (err) {
      return { retryAfterMs: 0, reason: `unreadable response: ${(err as Error).message}` };
    }
    if (Number.isFinite(reply.usage?.cost)) {
      this.cost += reply.usage!.cost!;
      this.costReported = true;
    }
    // OpenRouter can return 200 with an error body when the upstream provider fails.
    if (reply.error) return { retryAfterMs: 0, reason: `provider error: ${reply.error.message ?? reply.error.code}` };
    return reply;
  }

  private spend(model: string, reply: Reply): void {
    const spent = (this.usage[model] ??= { input: 0, output: 0 });
    spent.input += reply.usage?.prompt_tokens ?? 0;
    spent.output += reply.usage?.completion_tokens ?? 0;
  }

  private async once(model: string, messages: ChatMessage[]): Promise<ChatResult | Retry> {
    const reply = await this.post(model, { messages, temperature: 0.2 }, 90_000);
    if ('reason' in reply) return reply;
    const text = reply.choices?.[0]?.message?.content ?? '';
    if (!text.trim()) return { retryAfterMs: 0, reason: 'empty response' };
    return {
      text,
      model: reply.model ?? model,
      inputTokens: reply.usage?.prompt_tokens ?? 0,
      outputTokens: reply.usage?.completion_tokens ?? 0,
    };
  }

  /** Try each model in turn, retrying rate limits and server errors with backoff. */
  async chat(messages: ChatMessage[]): Promise<ChatResult> {
    const problems: string[] = [];
    let refusals = 0;
    for (const model of this.config.models) {
      for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
        let outcome: Awaited<ReturnType<LlmClient['once']>>;
        try {
          outcome = await this.once(model, messages);
        } catch (err) {
          if (!(err instanceof LlmError)) throw err;
          if (ABOUT_THE_REQUEST.has(err.status ?? 0)) refusals++;
          problems.push(err.message);
          this.noteRetry('rejected', `${(err as Error).message.slice(0, 120)}, trying the next model`);
          break;
        }
        if ('text' in outcome) {
          this.spend(outcome.model, { usage: { prompt_tokens: outcome.inputTokens, completion_tokens: outcome.outputTokens } });
          return outcome;
        }
        problems.push(`${model}: ${outcome.reason}`);
        // "HTTP 429", "network error" and so on: the part before any detail.
        const cause = outcome.reason.split(':')[0];
        if (attempt < this.config.maxRetries) {
          const wait = outcome.retryAfterMs || 5000 * 2 ** attempt;
          this.noteRetry(cause, `${model}, retrying in ${Math.round(wait / 1000)}s`);
          await this.sleep(wait);
        } else {
          this.noteRetry(cause, `${model}, giving up on this model`);
        }
      }
    }
    const failure = new LlmError(`All models failed. ${problems.join('; ')}`);
    failure.refused = refusals === this.config.models.length;
    throw failure;
  }

  /** A picture from the image model, retrying rate limits and server errors as `chat` does. `shape` is its proportions, such as "16:9". */
  async image(prompt: string, shape?: string): Promise<ImageResult> {
    const model = this.config.imageModel;
    if (!model) throw new LlmError('No image model is set (LLM_IMAGE_MODEL).');
    let problem = '';
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      // The shape is a setting some image models honour and others ignore; the prompt states it in words as well.
      const reply = await this.post(model, { messages: [{ role: 'user', content: prompt }], modalities: ['image', 'text'], ...(shape ? { image_config: { aspect_ratio: shape } } : {}) }, 180_000);
      if (!('reason' in reply)) {
        // The picture arrives as a data URL: data:image/png;base64,....
        const match = reply.choices?.[0]?.message?.images?.[0]?.image_url?.url?.match(/^data:(image\/[\w.+-]+);base64,(.+)$/s);
        this.spend(reply.model ?? model, reply);
        if (!match) throw new LlmError(`${model}: the reply had no image in it`);
        return { bytes: Buffer.from(match[2], 'base64'), mime: match[1], model: reply.model ?? model };
      }
      problem = reply.reason;
      const cause = problem.split(':')[0];
      if (attempt < this.config.maxRetries) {
        const wait = reply.retryAfterMs || 5000 * 2 ** attempt;
        this.noteRetry(cause, `${model}, retrying in ${Math.round(wait / 1000)}s`);
        await this.sleep(wait);
      } else {
        this.noteRetry(cause, `${model}, giving up on the picture`);
      }
    }
    throw new LlmError(`${model}: ${problem}`);
  }
}

export interface ModelInfo {
  id: string;
  name: string;
  contextLength: number;
  free: boolean;
  json: boolean;
  created: number;
}

/** The provider's model catalogue. Returns null when the endpoint has no price data. */
export async function listModels(baseUrl: string, fetchFn: typeof fetch = fetch): Promise<ModelInfo[] | null> {
  const res = await fetchFn(`${baseUrl}/models`, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) return null;
  const body = (await res.json()) as { data?: Record<string, any>[] };
  if (!body.data?.some((m) => m.pricing)) return null;
  return body.data.map((m) => {
    const params: string[] = m.supported_parameters ?? [];
    return {
      id: m.id,
      name: m.name ?? m.id,
      contextLength: m.context_length ?? 0,
      free: Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0,
      json: params.includes('response_format') || params.includes('structured_outputs'),
      created: m.created ?? 0,
    };
  });
}

/**
 * Drop configured models that now cost money, so a promotional price ending
 * never produces a bill. Set LLM_ALLOW_PAID=1 to skip the check.
 */
export async function keepFreeModels(config: LlmConfig, allowPaid: boolean): Promise<{ models: string[]; notes: string[] }> {
  if (allowPaid) return { models: config.models, notes: [] };
  const catalogue = await listModels(config.baseUrl, config.fetch).catch(() => null);
  if (!catalogue) {
    return { models: config.models, notes: ['Could not read model prices from this endpoint, so the free-only check was skipped.'] };
  }
  const byId = new Map(catalogue.map((m) => [m.id, m]));
  const models: string[] = [];
  const notes: string[] = [];
  for (const id of config.models) {
    const info = byId.get(id);
    if (!info) notes.push(`Skipping ${id}: not in the provider's model list.`);
    else if (!info.free) notes.push(`Skipping ${id}: it is no longer free. Set LLM_ALLOW_PAID=1 to use it anyway.`);
    else models.push(id);
  }
  return { models, notes };
}
