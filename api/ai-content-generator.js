/**
 * AI内容生成器 - 并行生成40个节点内容
 *
 * 使用方式：
 * - 首次生成: node ai-content-generator.js --mode=initial
 * - 每日更新: node ai-content-generator.js --mode=update
 *
 * 生成的内容保存在 pending_reviews/{slug}/ 目录
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEEPSEEK_API_KEY = 'sk-4e8e23e071184186b1a70bd7b87cbff3';
const DEEPSEEK_BASE_URL = 'api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-v4-pro';

// 节点列表（从data/nodes.json加载）
const NODES_DATA_PATH = path.join(__dirname, '..', 'data', 'nodes.json');
const PROMPTS_TEMPLATE_PATH = path.join(__dirname, '..', 'docs', 'ai-prompt-templates.md');
const PENDING_REVIEWS_DIR = path.join(__dirname, '..', 'pending_reviews');

// 并行生成数量
const PARALLEL_LIMIT = 5; // 每批并行生成5个节点

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
 */
async function deepseekSearch(query, startDate = null, endDate = new Date()) {
  let searchPrompt = `你需要搜索以下内容并提供最新信息：${query}`;

  if (startDate) {
    searchPrompt += `\n\n重要：请搜索 ${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]} 这个时间段内的最新内容。`;
    searchPrompt += `\n搜索平台包括：抖音、小红书、知乎、微信公众平台、36kr、虎嗅等社交媒体和科技媒体。`;
  } else {
    searchPrompt += `\n\n重要：请搜索2025-2026年的最新内容，优先来自权威媒体、政府网站、云厂商文档。`;
  }

  try {
    const result = await chatComplete([
      {
        role: 'system',
        content: `你是OPC节点百科的内容研究助手。任务：获取最新、最准确的信息（2025-2026年）。优先搜索中文内容（抖音、小红书、知乎、微信公众号、36kr、虎嗅等）。政策、费用、规则等信息要提供具体数据和来源。`
      },
      {
        role: 'user',
        content: searchPrompt
      }
    ], 4000);

    return { success: true, content: result.text };
  } catch (error) {
    console.error(`[搜索失败] ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 生成单个块的内容
 */
async function generateBlock(nodeInfo, blockId, blockTitle, blockContent, searchResults) {
  const systemPrompt = `你是一位专注于OPC（一人公司）创业领域的资深内容专家。
你的任务是按照提供的结构，为每个节点生成专业、实用、最新的内容。

## 【最关键】关于OPC的正确定义

**OPC = One Person Company = 一人公司创业**

- **绝对不能**将OPC理解为工业自动化领域的OPC UA协议
- OPC节点百科是关于"一个人如何创业"的导航系统
- 所有内容都围绕"自然人全资设立的有限责任公司"或"个体工商户"等一人公司形式展开
- 禁止生成任何与工业OPC（OPC UA、OPC Foundation、工厂设备通信协议）相关的内容

## 与通用公司形式的本质区别

OPC（一人公司）与以下形式有**本质区别**，生成内容时必须注意：

| 公司形式 | 与OPC的核心差异 |
|:---|:---|
| 有限合伙企业 | 需要至少1名普通合伙人(GP)承担无限连带责任 |
| 有限责任公司(2人以上) | 有股东会、董事会，决策需要表决程序 |
| 中型企业(100人以上) | 有完整组织架构，需要HR、社保、劳动合同管理 |
| 股份有限公司 | 需要董事会、监事会，注册资本门槛更高 |

OPC的核心特征：**一个人决策、一个人承担无限连带责任（财产混同风险）、没有团队分工**

## 内容生成原则

1. **实用性第一**：内容必须可操作、可落地，OPC照着做就能成功
2. **最新信息**：优先使用2025-2026年的最新政策、市场数据、工具信息
3. **纯OPC视角**：所有内容都基于"一个人公司"的假设，删除任何需要团队/融资/多人协作的内容
4. **中文内容**：所有内容为中文，使用中文标点符号
5. **数据支撑**：每个论点尽量有具体数据或案例支撑，注明数据来源和时间
6. **真实有效**：避免空洞的正确的废话，要具体、可操作

## 官方口吻要求

- 使用正式、权威的表达方式，如"根据《公司法》"、"依据xxx规定"
- 对于政策、法律法规类内容，使用"应当"、"不得"、"必须"等规范性用语
- 禁止口语化、随意化的表达，如"大家都知道的"、"其实吧"

## 复杂概念处理原则

每个复杂概念或专业术语首次出现时，必须：
1. 给出精确定义（1-2句话）
2. 附带具体事例或案例
3. 说明对OPC的实际影响

**示例**：
- "揭开公司面纱"：指法院在司法实践中否定公司法人独立地位，判令股东对公司债务承担连带责任。**事例**：一人公司A从未编制年度审计报告，账户与老板个人账户高度混同，法院判决老板以个人财产偿还公司债务。
- "认缴出资"：指股东承诺在未来某个时间点向公司缴纳的出资额。**事例**：注册资本100万、认缴期限5年，意味着最晚第5年要实缴到位。

## 内容禁止

1. 禁止使用绝对化用语：最、第一、顶级、唯一、保证、100%等
2. 禁止虚假承诺：无效退款、保证治愈、稳赚不赔等
3. 禁止政治敏感内容
4. 禁止抄袭：使用自己的语言表达，不要直接复制网络内容
5. 禁止过时信息：政策、费用、规则类信息必须是2025-2026年最新，法规必须标注文号和生效日期
6. 禁止混淆公司类型：绝对不能将OPC与有限合伙、中大型有限责任公司混淆

## 衡量标准

每个块的内容不以字数衡量，以以下三个标准衡量：
- **真实**：内容来源于实际搜索和验证，不是编造。每个数据、案例、政策必须有据可查。
- **详细**：在没有冗余的前提下，将问题阐述清晰。覆盖OPC场景下的常见情况、边界情况、注意事项。
- **逻辑性**：结构清晰，层次分明。先讲为什么，再讲是什么，最后讲怎么做。

## 政策信息时效性要求

- 中国税法规定：必须标注具体税种、税率、优惠期限
- 《公司法》条款：必须标注第XX条及最近修订时间
- 地方性规定：必须标注适用地区范围
- 2024年7月1日新《公司法》要点：
  - 注册资本5年实缴义务
  - 一个自然人只能设立一个一人有限责任公司
  - 一人公司需年度审计报告`;

  const userPrompt = `请为以下节点生成内容：

节点信息：
- 节点ID: ${nodeInfo.id}
- 节点标题: ${nodeInfo.title}
- 节点slug: ${nodeInfo.slug}
- 内容块: ${blockId} - ${blockTitle}

内容要求：
${blockContent}

搜索参考信息（来自最新网络搜索）：
${searchResults}

请直接输出内容，不要加标题前缀，不要加块编号前缀，不要加装饰符号，直接输出正文。`;

  try {
    const result = await chatComplete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 4000);

    return {
      blockId,
      blockTitle,
      content: result.text,
      success: true
    };
  } catch (error) {
    console.error(`[生成失败] ${nodeInfo.slug}/${blockId}: ${error.message}`);
    return {
      blockId,
      blockTitle,
      content: null,
      success: false,
      error: error.message
    };
  }
}

/**
 * 生成单个节点的所有9个块
 */
async function generateNode(nodeInfo, mode = 'initial') {
  console.log(`\n[生成开始] ${nodeInfo.id.toString().padStart(2, '0')} - ${nodeInfo.title}`);

  // 计算时间范围
  const now = new Date();
  let searchStartDate = null;
  if (mode === 'update') {
    searchStartDate = new Date(now);
    searchStartDate.setDate(searchStartDate.getDate() - 1);
    searchStartDate.setHours(0, 0, 0, 0);
  }
  now.setHours(0, 0, 0, 0);

  // 1. 搜索相关最新信息
  // 【重要】OPC = One Person Company = 一人公司创业，不是工业OPC UA协议
  console.log(`[搜索] ${nodeInfo.title}...`);
  const searchQuery = `${nodeInfo.title} 一人公司创业 OPC节点百科 2026`;
  const searchResults = await deepseekSearch(
    searchQuery,
    searchStartDate,
    now
  );

  // 2. 定义9个块的内容要求
  const blocks = getNodeBlocks(nodeInfo);

  // 3. 并行生成9个块（分批）
  console.log(`[生成] 9个块，并行生成中...`);

  const blockResults = [];
  for (const block of blocks) {
    const result = await generateBlock(
      nodeInfo,
      block.id,
      block.title,
      block.content,
      searchResults.success ? searchResults.content : ''
    );
    blockResults.push(result);

    // 短暂延迟，避免API限流
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`[生成完成] ${nodeInfo.slug}: ${blockResults.filter(r => r.success).length}/9 块成功`);

  return {
    nodeId: nodeInfo.id,
    slug: nodeInfo.slug,
    title: nodeInfo.title,
    searchResults,
    blocks: blockResults,
    generatedAt: new Date().toISOString()
  };
}

/**
 * 获取节点的9个块定义
 */
function getNodeBlocks(nodeInfo) {
  const nodeId = nodeInfo.id.toString().padStart(2, '0');

  // 这里可以根据需要为每个节点定制内容结构
  // 目前使用通用结构
  return [
    {
      id: 'B1',
      title: '概述',
      content: '生成概述内容，包含：OPC创业的定义和特点、为什么需要这个节点、这个节点能帮助用户什么。'
    },
    {
      id: 'B2',
      title: '详细说明（一）',
      content: '生成第一部分详细说明。'
    },
    {
      id: 'B3',
      title: '详细说明（二）',
      content: '生成第二部分详细说明。'
    },
    {
      id: 'B4',
      title: '详细说明（三）',
      content: '生成第三部分详细说明。'
    },
    {
      id: 'B5',
      title: '详细说明（四）',
      content: '生成第四部分详细说明。'
    },
    {
      id: 'B6',
      title: '详细说明（五）',
      content: '生成第五部分详细说明。'
    },
    {
      id: 'B7',
      title: '常见问题 Q1-Q4',
      content: '生成4个常见问题（Q1-Q4），每个问题约200字左右，涵盖用户最关心的核心问题。'
    },
    {
      id: 'B8',
      title: '常见问题 Q5-Q8',
      content: '生成4个常见问题（Q5-Q8），每个问题约200字左右，覆盖更多延展性问题。'
    },
    {
      id: 'B9',
      title: '相关资源',
      content: '生成相关资源列表，包括：OPC节点百科完整地图、GStack需求梳理方法论、一人公司创业模型白皮书2026，以及其他相关资源链接。'
    }
  ];
}

/**
 * 保存生成结果到 pending_reviews 目录
 */
function savePendingReview(nodeResult) {
  const nodeDir = path.join(PENDING_REVIEWS_DIR, nodeResult.slug);
  fs.mkdirSync(nodeDir, { recursive: true });

  // 保存完整内容（合并9个块）
  const fullContent = `# ${nodeResult.title}

## 需求文档

### 基本信息
- **节点ID**: ${nodeResult.nodeId.toString().padStart(2, '0')}
- **slug**: ${nodeResult.slug}
- **分类**: 1-10
- **难度**: 待填写
- **咨询价格**: ¥待填写

### 功能需求
1. [待填写 - 根据节点内容生成]

### 验收标准
- [ ] 标准1
- [ ] 标准2

---

## 当前内容

### 概述

${nodeResult.blocks.find(b => b.blockId === 'B1')?.content || ''}

### 详细说明

#### 一、${nodeResult.blocks.find(b => b.blockId === 'B2')?.content || ''}

#### 二、${nodeResult.blocks.find(b => b.blockId === 'B3')?.content || ''}

#### 三、${nodeResult.blocks.find(b => b.blockId === 'B4')?.content || ''}

#### 四、${nodeResult.blocks.find(b => b.blockId === 'B5')?.content || ''}

#### 五、${nodeResult.blocks.find(b => b.blockId === 'B6')?.content || ''}

### 常见问题

**Q1:** ${extractQA(nodeResult.blocks.find(b => b.blockId === 'B7')?.content, 1)}

**Q2:** ${extractQA(nodeResult.blocks.find(b => b.blockId === 'B7')?.content, 2)}

**Q3:** ${extractQA(nodeResult.blocks.find(b => b.blockId === 'B7')?.content, 3)}

**Q4:** ${extractQA(nodeResult.blocks.find(b => b.blockId === 'B7')?.content, 4)}

**Q5:** ${extractQA(nodeResult.blocks.find(b => b.blockId === 'B8')?.content, 1)}

**Q6:** ${extractQA(nodeResult.blocks.find(b => b.blockId === 'B8')?.content, 2)}

**Q7:** ${extractQA(nodeResult.blocks.find(b => b.blockId === 'B8')?.content, 3)}

**Q8:** ${extractQA(nodeResult.blocks.find(b => b.blockId === 'B8')?.content, 4)}

### 相关资源

${nodeResult.blocks.find(b => b.blockId === 'B9')?.content || ''}

---

*AI生成版本 | 生成时间: ${nodeResult.generatedAt}*
*版本: v1.0*
*审核状态: 待审批*
`;

  fs.writeFileSync(
    path.join(nodeDir, 'content.md'),
    fullContent,
    'utf-8'
  );

  // 保存metadata
  const metadata = {
    nodeId: nodeResult.nodeId,
    slug: nodeResult.slug,
    title: nodeResult.title,
    generatedAt: nodeResult.generatedAt,
    blocks: nodeResult.blocks.map(b => ({
      id: b.blockId,
      title: b.blockTitle,
      success: b.success,
      length: b.content?.length || 0
    })),
    searchResults: {
      success: nodeResult.searchResults.success,
      contentLength: nodeResult.searchResults.content?.length || 0
    }
  };

  fs.writeFileSync(
    path.join(nodeDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );

  console.log(`[保存] ${nodeResult.slug}/content.md + metadata.json`);
}

/**
 * 从块内容中提取Q&A
 */
function extractQA(content, qIndex) {
  if (!content) return '待填写';
  // 简单处理：假设内容中包含Q和A
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length >= qIndex * 2) {
    return lines[(qIndex - 1) * 2] + '\n' + lines[(qIndex - 1) * 2 + 1];
  }
  return content.substring(0, 200);
}

/**
 * 加载节点列表
 */
function loadNodes() {
  try {
    const data = JSON.parse(fs.readFileSync(NODES_DATA_PATH, 'utf-8'));
    return data.nodes || [];
  } catch (error) {
    console.error(`[错误] 无法加载节点数据: ${error.message}`);
    return [];
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--mode=update') ? 'update' : 'initial';

  console.log(`\n========================================`);
  console.log(`[AI内容生成器] 启动`);
  console.log(`[模式] ${mode}`);
  console.log(`========================================\n`);

  // 确保输出目录存在
  fs.mkdirSync(PENDING_REVIEWS_DIR, { recursive: true });

  // 加载节点列表
  const nodes = loadNodes();
  console.log(`[加载] ${nodes.length} 个节点\n`);

  // 串行生成（每次处理1个节点，避免API并发限制）
  const results = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    console.log(`\n[批次 ${i + 1}/${nodes.length}] 处理节点: ${node.id.toString().padStart(2, '0')} - ${node.title}`);

    const result = await generateNode(node, mode);
    if (result) {
      savePendingReview(result);
      results.push(result);
    }

    console.log(`[进度] ${i + 1}/${nodes.length}`);
  }

  // 输出统计
  const successBlocks = results.reduce((sum, r) =>
    sum + r.blocks.filter(b => b.success).length, 0
  );
  const totalBlocks = results.length * 9;

  console.log(`\n========================================`);
  console.log(`[生成完成]`);
  console.log(`节点: ${results.length}/${nodes.length}`);
  console.log(`块: ${successBlocks}/${totalBlocks}`);
  console.log(`========================================\n`);

  // 输出待审列表
  console.log('待审内容：');
  results.forEach(r => {
    console.log(`  - ${r.slug}/: ${r.blocks.filter(b => b.success).length}/9 块成功`);
  });
}

// 运行
main().catch(console.error);