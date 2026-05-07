/**
 * AI内容生成器 - 续传版本
 * 从已完成的节点之后继续生成
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEEPSEEK_API_KEY = 'sk-4e8e23e071184186b1a70bd7b87cbff3';
const DEEPSEEK_BASE_URL = 'api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-v4-pro';

const NODES_DATA_PATH = path.join(__dirname, '..', 'data', 'nodes.json');
const PENDING_REVIEWS_DIR = path.join(__dirname, '..', 'pending_reviews');

// 已完成的节点（跳过）
const SKIP_SLUGS = ['opc-fit-test', 'personal-resources', 'idea-validation', 'business-structure'];

function chatComplete(messages, max_tokens = 4000) {
  return new Promise((resolve, reject) => {
    const payload = { model: DEEPSEEK_MODEL, messages, max_tokens, stream: false };
    const data = JSON.stringify(payload);
    const options = {
      hostname: DEEPSEEK_BASE_URL, path: '/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ text: json.choices?.[0]?.message?.content || '', usage: json.usage });
        } catch (e) { reject(new Error(`JSON parse failed: ${body.substring(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function deepseekSearch(query) {
  console.log(`[搜索] "${query}"`);
  try {
    const result = await chatComplete([
      { role: 'system', content: `你是OPC节点百科的内容研究助手。关于"OPC"的正确定义：OPC = One Person Company = 一人公司创业，不是工业OPC UA协议。所有内容围绕"一人公司创业"展开。` },
      { role: 'user', content: `搜索以下内容，提供2025-2026年最新信息：${query}` }
    ], 4000);
    return { success: true, content: result.text };
  } catch (error) {
    console.error(`[搜索失败] ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function generateBlock(nodeInfo, blockId, blockTitle, blockContent, searchResults) {
  const systemPrompt = `你是一位专注于OPC（一人公司）创业领域的资深内容专家。

## 【最关键】关于OPC的正确定义
**OPC = One Person Company = 一人公司创业** - 绝对不能将OPC理解为工业OPC UA协议

## 与通用公司形式的本质区别
OPC核心特征：一个人决策、一个人承担无限连带责任、没有团队分工

## 内容生成原则
1. 实用性第一，可操作、可落地
2. 最新信息：2025-2026年的政策、市场数据
3. 纯OPC视角：删除任何需要团队/融资的内容
4. 中文内容，使用中文标点符号
5. 数据支撑，注明来源和时间
6. 官方口吻，对于复杂概念给出精确定义和事例

## 内容禁止
1. 禁止绝对化用语
2. 禁止虚假承诺
3. 禁止政治敏感内容
4. 禁止混淆OPC与工业OPC`;

  const userPrompt = `请为以下节点生成内容：

节点：${nodeInfo.title} (${nodeInfo.slug})
内容块：${blockId} - ${blockTitle}
要求：${blockContent}

搜索参考：${searchResults || '无'}

直接输出正文，不要加标题前缀。`;

  try {
    const result = await chatComplete([{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], 4000);
    return { blockId, blockTitle, content: result.text, success: true };
  } catch (error) {
    console.error(`[生成失败] ${nodeInfo.slug}/${blockId}: ${error.message}`);
    return { blockId, blockTitle, content: null, success: false, error: error.message };
  }
}

async function generateNode(nodeInfo) {
  console.log(`\n[生成开始] ${nodeInfo.id.toString().padStart(2, '0')} - ${nodeInfo.title}`);

  const searchResults = await deepseekSearch(`${nodeInfo.title} 一人公司创业 OPC节点百科 2026`);
  const blocks = [
    { id: 'B1', title: '概述', content: '生成概述内容，包含：OPC创业的定义和特点、为什么需要这个节点、这个节点能帮助用户什么。' },
    { id: 'B2', title: '详细说明（一）', content: '第一部分详细说明。' },
    { id: 'B3', title: '详细说明（二）', content: '第二部分详细说明。' },
    { id: 'B4', title: '详细说明（三）', content: '第三部分详细说明。' },
    { id: 'B5', title: '详细说明（四）', content: '第四部分详细说明。' },
    { id: 'B6', title: '详细说明（五）', content: '第五部分详细说明。' },
    { id: 'B7', title: '常见问题 Q1-Q4', content: '4个常见问题（Q1-Q4），每个问题约200字左右。' },
    { id: 'B8', title: '常见问题 Q5-Q8', content: '4个常见问题（Q5-Q8），每个问题约200字左右。' },
    { id: 'B9', title: '相关资源', content: '相关资源列表，包括OPC节点百科完整地图、GStack需求梳理方法论等。' }
  ];

  const blockResults = [];
  for (const block of blocks) {
    const result = await generateBlock(nodeInfo, block.id, block.title, block.content, searchResults.success ? searchResults.content : '');
    blockResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`[生成完成] ${nodeInfo.slug}: ${blockResults.filter(r => r.success).length}/9 块成功`);
  return { nodeId: nodeInfo.id, slug: nodeInfo.slug, title: nodeInfo.title, searchResults, blocks: blockResults, generatedAt: new Date().toISOString() };
}

function extractQA(content, qIndex) {
  if (!content) return '待填写';
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length >= qIndex * 2) return lines[(qIndex - 1) * 2] + '\n' + lines[(qIndex - 1) * 2 + 1];
  return content.substring(0, 200);
}

function savePendingReview(nodeResult) {
  const nodeDir = path.join(PENDING_REVIEWS_DIR, nodeResult.slug);
  fs.mkdirSync(nodeDir, { recursive: true });

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

  fs.writeFileSync(path.join(nodeDir, 'content.md'), fullContent, 'utf-8');

  const metadata = {
    nodeId: nodeResult.nodeId, slug: nodeResult.slug, title: nodeResult.title, generatedAt: nodeResult.generatedAt,
    blocks: nodeResult.blocks.map(b => ({ id: b.blockId, title: b.blockTitle, success: b.success, length: b.content?.length || 0 })),
    searchResults: { success: nodeResult.searchResults.success, contentLength: nodeResult.searchResults.content?.length || 0 }
  };
  fs.writeFileSync(path.join(nodeDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`[保存] ${nodeResult.slug}/content.md + metadata.json`);
}

async function main() {
  console.log(`\n========================================`);
  console.log(`[AI内容生成器] 续传模式`);
  console.log(`[跳过] ${SKIP_SLUGS.length} 个已完成节点`);
  console.log(`========================================\n`);

  fs.mkdirSync(PENDING_REVIEWS_DIR, { recursive: true });
  const nodes = JSON.parse(fs.readFileSync(NODES_DATA_PATH, 'utf-8')).nodes;

  const remainingNodes = nodes.filter(n => !SKIP_SLUGS.includes(n.slug));
  console.log(`[加载] ${remainingNodes.length} 个待生成节点\n`);

  const results = [];
  for (let i = 0; i < remainingNodes.length; i++) {
    const node = remainingNodes[i];
    console.log(`\n[批次 ${i + 1}/${remainingNodes.length}] 处理节点: ${node.id.toString().padStart(2, '0')} - ${node.title}`);
    const result = await generateNode(node);
    if (result) { savePendingReview(result); results.push(result); }
    console.log(`[进度] ${i + 1}/${remainingNodes.length}`);
  }

  const successBlocks = results.reduce((sum, r) => sum + r.blocks.filter(b => b.success).length, 0);
  console.log(`\n========================================`);
  console.log(`[完成] 生成 ${results.length} 个节点, ${successBlocks} 个块`);
  console.log(`========================================`);
}

main().catch(console.error);
