/**
 * AI Provider 抽象层
 *
 * 统一多种 LLM 服务（TokenHub / MiniMax / 任何 OpenAI-兼容端点）的接口。
 * 上层业务（analyze.js）只关心 chat() 和 stream()，不关心底层哪家。
 *
 * 设计原则：
 * - 单一事实来源：所有 AI 调用走 chat(messages, options)
 * - 易于扩展：新增 provider 只需继承 AIProvider
 * - 失败降级：provider 出错时调用方捕获，业务层有兜底
 * - 配置驱动：通过 .env 切换 provider，不改代码
 */

const PROVIDER_CONFIGS = {
  tokenhub: {
    name: 'tokenhub',
    baseUrl: 'https://tokenhub.tencentmaas.com/v1/chat/completions',
    defaultModel: 'deepseek-v4-flash',
    apiKeyEnv: 'API_KEY',
    description: '腾讯 TokenHub (DeepSeek V4 Flash)'
  },
  minimax: {
    name: 'minimax',
    baseUrl: 'https://api.minimaxi.com/v1/chat/completions',
    defaultModel: 'MiniMax-M3',
    apiKeyEnv: 'MINIMAX_API_KEY',
    description: 'MiniMax (MiniMax-M3)'
  },
  openai: {
    name: 'openai',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    apiKeyEnv: 'OPENAI_API_KEY',
    description: 'OpenAI 兼容端点'
  }
};

/**
 * AI Provider 基类
 * 子类只需指定 baseUrl 和 defaultModel
 */
class AIProvider {
  constructor(config) {
    if (!config) throw new Error('Provider config required');
    this.name = config.name;
    this.baseUrl = config.baseUrl;
    this.defaultModel = config.defaultModel;
    this.apiKey = config.apiKey;
    this.description = config.description || config.name;
  }

  /**
   * 核心方法：发送 chat 请求
   * @param {Array<{role, content}>} messages
   * @param {Object} options - { model, temperature, maxTokens, signal }
   * @returns {Promise<string>} 模型回复内容
   */
  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error(`[${this.name}] API key not configured`);
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('messages must be a non-empty array');
    }

    const body = {
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1500,
      stream: false
    };

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    };
    if (options.signal) fetchOptions.signal = options.signal;

    const response = await fetch(this.baseUrl, fetchOptions);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`[${this.name}] API ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`[${this.name}] Empty response from API`);
    }
    return content;
  }

  /**
   * 健康检查（轻量级 ping）
   * @returns {Promise<{ok: boolean, latencyMs: number, error?: string}>}
   */
  async health() {
    const start = Date.now();
    try {
      await this.chat(
        [{ role: 'user', content: 'ping' }],
        { maxTokens: 5, temperature: 0 }
      );
      return { ok: true, latencyMs: Date.now() - start };
    } catch (e) {
      return { ok: false, latencyMs: Date.now() - start, error: e.message };
    }
  }
}

/**
 * 工厂：从环境变量创建 provider
 * @param {string} [name] - provider 名（默认读 AI_PROVIDER 环境变量，再回退到 tokenhub）
 * @returns {AIProvider}
 */
function createProvider(name) {
  const providerName = name || process.env.AI_PROVIDER || 'tokenhub';
  const config = PROVIDER_CONFIGS[providerName];
  if (!config) {
    throw new Error(
      `Unknown provider: ${providerName}. Available: ${Object.keys(PROVIDER_CONFIGS).join(', ')}`
    );
  }
  const apiKey = process.env[config.apiKeyEnv] || '';
  return new AIProvider({
    name: config.name,
    baseUrl: config.baseUrl,
    defaultModel: config.defaultModel,
    apiKey,
    description: config.description
  });
}

/**
 * 列出所有可用 provider（用于管理后台/调试）
 */
function listProviders() {
  return Object.values(PROVIDER_CONFIGS).map(c => ({
    name: c.name,
    defaultModel: c.defaultModel,
    apiKeyEnv: c.apiKeyEnv,
    description: c.description,
    hasKey: !!process.env[c.apiKeyEnv]
  }));
}

module.exports = {
  AIProvider,
  createProvider,
  listProviders,
  PROVIDER_CONFIGS
};
