/**
 * ONE-MCN LLM 统一客户端
 * v5.4.3 — Lesson 8 修复：接通 Anthropic Claude API
 *
 * 配置（用户已提供）：
 *   ANTHROPIC_BASE_URL=https://relay.bytenote.net
 *   ANTHROPIC_AUTH_TOKEN=cr_...
 *
 * 或 OpenAI:
 *   OPENAI_API_KEY=sk-...
 */
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

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
  return process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY
    ? 'anthropic'
    : 'openai';
}

function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

function getAnthropicClient(): Anthropic | null {
  const token = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
  if (!token) return null;

  // 兼容 relay：支持 ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN
  // @anthropic-ai/sdk 的 client options:
  //   apiKey (必需) + baseURL (可选，relay 必需)
  return new Anthropic({
    apiKey: token,
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  });
}

/**
 * 统一 chat 接口
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

  // Anthropic Claude
  const client = getAnthropicClient();
  if (!client) {
    throw new Error('ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN not set');
  }

  const systemMsg = messages.find((m) => m.role === 'system');
  const userMsgs = messages.filter((m) => m.role !== 'system');

  const response = await client.messages.create({
    model: options.model || DEFAULT_MODEL_ANTHROPIC,
    max_tokens: options.max_tokens ?? 1024,
    temperature: options.temperature ?? 0.7,
    system: systemMsg?.content,
    messages: userMsgs.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  });

  // response.content 是 array，提取 text type
  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
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
 * 流式输出（暂只支持 OpenAI）
 */
export async function* chatStream(
  messages: ChatMessage[],
  options: ChatOptions = {}
): AsyncIterable<string> {
  const provider = options.provider || getProvider();
  if (provider !== 'openai') {
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