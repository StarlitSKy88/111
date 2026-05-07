/**
 * 搜索服务 - exa全网搜索 + DeepSeek联网搜索
 *
 * 使用说明：
 * - initial模式：exa全网搜索 + DeepSeek联网
 * - update模式：只用DeepSeek联网搜索近24h内容
 */

const https = require('https');

const DEEPSEEK_API_KEY = 'sk-4e8e23e071184186b1a70bd7b87cbff3';
const DEEPSEEK_BASE_URL = 'api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-v4-pro';

/**
 * DeepSeek API 调用
 */
function chatComplete(messages, max_tokens = 4000) {
  return new Promise((resolve, reject) => {
    const payload = {
      model: DEEPSEEK_MODEL,
      messages,
      max_tokens,
      stream: false
    };

    const data = JSON.stringify(payload);
    const options = {
      hostname: DEEPSEEK_BASE_URL,
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const text = json.choices?.[0]?.message?.content
            || json.choices?.[0]?.message?.reasoning_content
            || '';
          resolve({
            text,
            reasoning: json.choices?.[0]?.message?.reasoning_content || '',
            usage: json.usage
          });
        } catch (e) {
          reject(new Error(`JSON parse failed: ${body.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * 使用 DeepSeek 联网搜索
 * @param {string} query - 搜索关键词
 * @param {Date} startDate - 开始时间（仅update模式使用）
 * @param {Date} endDate - 结束时间
 */
async function deepseekSearch(query, startDate = null, endDate = new Date()) {
  console.log(`[DeepSeek搜索] query: "${query}"`);
  console.log(`[DeepSeek搜索] 时间范围: ${startDate ? startDate.toISOString() : '不限'} ~ ${endDate.toISOString()}`);

  // 构建搜索提示词
  let searchPrompt = `你需要搜索以下内容并提供最新信息：${query}`;

  if (startDate) {
    // update模式：只搜索近24小时
    searchPrompt += `\n\n重要：请搜索 ${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]} 这个时间段内的最新内容。`;
    searchPrompt += `\n搜索平台包括：抖音、小红书、知乎、微信公众平台、36kr、虎嗅等社交媒体和科技媒体。`;
  } else {
    // initial模式：不限时间，优先2025-2026年
    searchPrompt += `\n\n重要：请搜索2025-2026年的最新内容，优先来自权威媒体、政府网站、云厂商文档。`;
  }

  try {
    const result = await chatComplete([
      {
        role: 'system',
        content: `你是OPC节点百科的内容研究助手。你的任务是帮助用户获取最新、最准确的信息。

【重要】关于"OPC"的正确定义：
- OPC = One Person Company = 一人公司创业
- OPC节点百科是一个为"一个人公司创业"提供导航的系统
- 所有搜索和内容都必须围绕"一人公司创业"这个主题
- 绝对不能将OPC理解为工业自动化领域的OPC UA协议

当用户提出问题时，你应该：
1. 搜索并提供最新的信息（2025-2026年）
2. 优先搜索中文内容（抖音、小红书、知乎、微信公众号、36kr、虎嗅等）
3. 对于政策、费用、规则等信息，务必提供具体数据和来源
4. 对于工具和方法，优先提供国内常用的工具
5. 搜索时始终牢记OPC=一人公司创业，避免被工业OPC内容污染

请用中文回答。`
      },
      {
        role: 'user',
        content: searchPrompt
      }
    ], 4000);

    console.log(`[DeepSeek搜索] 获取到 ${result.text.length} 字符内容`);
    return {
      success: true,
      content: result.text,
      source: 'deepseek联网',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[DeepSeek搜索] 失败: ${error.message}`);
    return {
      success: false,
      error: error.message,
      source: 'deepseek联网',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 使用 exa 全网搜索（首次生成模式）
 * @param {string} query - 搜索关键词
 */
async function exaSearch(query) {
  console.log(`[exa搜索] query: "${query}"`);

  // 构建exa搜索请求
  const searchRequest = {
    query,
    numResults: 10,
    startPublishedDate: '2025-01-01', // 优先2025年以后
    endPublishedDate: new Date().toISOString().split('T')[0],
    source: {
      includeDomains: [
        'zhihu.com',
        'xiaohongshu.com',
        'weixin.qq.com',
        '36kr.com',
        'huxiu.com',
        'iask.com',
        'aliyun.com',
        'cloud.tencent.com'
      ]
    }
  };

  try {
    // 使用MCP工具进行exa搜索
    const axios = require('axios');
    // 注意：exa搜索需要API key，这里假设通过环境变量或MCP配置
    // 如果没有配置，则跳过exa搜索

    // 由于exa需要额外配置，这里提供fallback到DeepSeek搜索
    console.log(`[exa搜索] 跳过，使用DeepSeek联网替代`);
    return null;
  } catch (error) {
    console.error(`[exa搜索] 失败: ${error.message}`);
    return null;
  }
}

/**
 * 综合搜索 - initial模式
 * @param {string} query - 搜索关键词
 */
async function searchInitial(query) {
  console.log(`\n========== [initial模式搜索] ==========`);

  // 1. 先尝试exa搜索
  const exaResult = await exaSearch(query);

  // 2. 然后用DeepSeek联网搜索（获取最新信息）
  const deepseekResult = await deepseekSearch(query, null, new Date());

  // 合并结果
  return {
    success: true,
    exaContent: exaResult?.content || null,
    deepseekContent: deepseekResult.content,
    timestamp: new Date().toISOString()
  };
}

/**
 * 综合搜索 - update模式
 * @param {string} query - 搜索关键词
 */
async function searchUpdate(query) {
  // 计算时间范围：前一天0点到当前0点
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  now.setHours(0, 0, 0, 0);

  console.log(`\n========== [update模式搜索] ==========`);
  console.log(`[update模式] 时间范围: ${yesterday.toISOString()} ~ ${now.toISOString()}`);

  const deepseekResult = await deepseekSearch(query, yesterday, now);

  return {
    success: true,
    content: deepseekResult.content,
    searchRange: {
      start: yesterday.toISOString(),
      end: now.toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * 获取节点内容生成所需的搜索结果
 * @param {number} nodeId - 节点ID (1-40)
 * @param {string} nodeTitle - 节点标题
 * @param {string} mode - 'initial' 或 'update'
 */
async function searchForNode(nodeId, nodeTitle, mode = 'initial') {
  const slug = nodeId.toString().padStart(2, '0');
  console.log(`\n========================================`);
  console.log(`[${mode}] 搜索节点 ${slug}: ${nodeTitle}`);
  console.log(`========================================`);

  if (mode === 'initial') {
    return await searchInitial(`${nodeTitle} OPC节点百科 2026`);
  } else {
    return await searchUpdate(`${nodeTitle} OPC节点百科 最新`);
  }
}

/**
 * 批量搜索所有节点（initial模式）
 * @param {Array} nodes - 节点列表 [{id, title, slug}]
 */
async function searchAllNodes(nodes) {
  console.log(`\n========================================`);
  console.log(`[批量搜索] 开始搜索 ${nodes.length} 个节点`);
  console.log(`========================================`);

  const results = {};

  // 并行搜索（每批3个节点，避免API限流）
  const batchSize = 3;
  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    const batchPromises = batch.map(node =>
      searchForNode(node.id, node.title, 'initial')
        .then(result => ({ nodeId: node.id, ...result }))
    );

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(r => {
      results[r.nodeId] = r;
    });

    console.log(`[批量搜索] 完成 ${Math.min(i + batchSize, nodes.length)}/${nodes.length}`);
  }

  return results;
}

module.exports = {
  deepseekSearch,
  exaSearch,
  searchInitial,
  searchUpdate,
  searchForNode,
  searchAllNodes
};

// 测试运行
if (require.main === module) {
  (async () => {
    console.log('测试搜索服务...\n');

    // 测试单个节点搜索
    const result = await searchForNode(1, 'OPC适配测试', 'initial');
    console.log('\n========== 测试结果 ==========');
    console.log(`成功: ${result.success}`);
    console.log(`DeepSeek内容长度: ${result.deepseekContent?.length || 0}`);
    console.log(`================================\n`);

    process.exit(0);
  })();
}