/**
 * ONE-MCN LLM 统一客户端
 * v5.4 — 支持 OpenAI + Anthropic 双引擎
 *
 * 待 LLM API key 后即可使用：
 *   OPENAI_API_KEY=sk-...
 *   ANTHROPIC_API_KEY=sk-ant-...
 *
 * 默认：Anthropic Claude 3.5 Sonnet（中文友好 + 长 context）
 */
import OpenAI from 'openai';

export type LLMProvider = 'openai' | 'anthropic';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  provider?: LLMProvider;
}

const DEFAULT_MODEL_OPENAI = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
const DEFAULT_MODEL_ANTHROPIC = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

function getProvider(): LLMProvider {
  const explicit = process.env.LLM_PROVIDER as LLMProvider | undefined;
  if (explicit === 'openai' || explicit === 'anthropic') return explicit;
  // 默认：anthropic（中文友好）
  return process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai';
}

function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

/**
 * 统一 chat 接口
 * 待两个 SDK 都安装后接入
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const provider = options.provider || getProvider();

  if (provider === 'openai') {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OPENAI_API_KEY not set');
    }
    const completion = await client.chat.completions.create({
      model: options.model || DEFAULT_MODEL_OPENAI,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
    });
    return completion.choices[0]?.message?.content || '';
  }

  // Anthropic Claude（占位 — 需要装 @anthropic-ai/sdk）
  // 真实集成时：
  // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // const msg = await anthropic.messages.create({
  //   model: options.model || DEFAULT_MODEL_ANTHROPIC,
  //   max_tokens: options.max_tokens ?? 1024,
  //   messages: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
  //   system: messages.find(m => m.role === 'system')?.content,
  // });
  // return msg.content[0]?.type === 'text' ? msg.content[0].text : '';

  throw new Error('Anthropic SDK not installed yet. Run: pnpm add @anthropic-ai/sdk');
}

/**
 * 单条 prompt 简化接口
 */
export async function complete(
  prompt: string,
  systemPrompt = 'You are a helpful AI assistant.',
  options: ChatOptions = {}
): Promise<string> {
  return chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    options
  );
}

/**
 * 流式输出（用于 dashboard 实时显示 Agent 思考过程）
 */
export async function* chatStream(
  messages: ChatMessage[],
  options: ChatOptions = {}
): AsyncIterable<string> {
  const provider = options.provider || getProvider();
  if (provider !== 'openai') {
    // 暂只支持 OpenAI streaming
    throw new Error('Streaming only supported for OpenAI');
  }
  const client = getOpenAIClient();
  if (!client) throw new Error('OPENAI_API_KEY not set');

  const stream = await client.chat.completions.create({
    model: options.model || DEFAULT_MODEL_OPENAI,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1024,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}