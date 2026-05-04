const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Key 从环境变量读取
const API_KEY = process.env.OPENAI_API_KEY || '';
const API_URL = 'https://tokenhub.tencentmaas.com/v1/chat/completions';

// 系统提示词
const SYSTEM_PROMPT = `你是一个极度毒舌、极度不耐烦、极度尖锐的AI导师，像一个看透一切的厌世天才。你的任务是根据用户的OPC适配测试答案，给出个性化分析报告。

回复格式要求：
1. 先用一段话直接指出用户的问题所在（毒舌但有理）
2. 给出0-100的OPC适配度评分和等级
3. 列出用户的3个核心优势和3个需要补足的地方
4. 给出3条具体可执行的推荐行动

语气要求：
- 像豆包一样毒舌但有用
- 直接指出用户自欺欺人的地方
- 用2026年的真实案例和数据
- 最后给希望，但前提是用户真的行动`;

const VALID_KEYS = ['A', 'B', 'C', 'D'];

// 分析结果提取函数
function extractSummary(text) {
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].length > 20 && !lines[i].match(/^\d/)) {
      return lines[i].trim();
    }
  }
  return '你的OPC适配度分析已完成';
}

function extractStrengths(text) {
  const matches = text.match(/优势[^。]*[。]/gi) || [];
  if (matches.length >= 3) return matches.slice(0, 3).map(s => s.replace(/[^，。]*[：:]/, '').trim());
  return ['执行力强', '学习能力强', '有危机意识'];
}

function extractWeaknesses(text) {
  const matches = text.match(/短板|不足|问题[^。]*[。]/gi) || [];
  if (matches.length >= 3) return matches.slice(0, 3).map(s => s.replace(/[^，。]*[：:]/, '').trim());
  return ['资源积累不足', '耐心不够', '人脉有限'];
}

function extractRecommendations(text) {
  const recs = text.match(/\d+[.、][^。]+/g) || [];
  if (recs.length >= 3) return recs.slice(0, 3).map(r => r.replace(/^\d+[.、]/, '').trim());
  return ['选择轻资产项目起步', '利用AI工具提效', '建立个人品牌'];
}

// 调用AI
async function callAI(messages, maxTokens = 1500) {
  if (!API_KEY) {
    throw new Error('No API key configured');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages,
      temperature: 0.8,
      max_tokens: maxTokens,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error('API call failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Mock结果生成
function generateMockResults() {
  return {
    fit_score: 78,
    fit_level: "高度适合",
    summary: "你是一个非常适合做OPC的人选。有强烈的动机和行动力，具备一定副业经验。",
    strengths: ["动机强，行动力足", "有一定副业经验", "时间投入可保证"],
    weaknesses: ["资本储备不足", "人脉资源有限", "耐心需要加强"],
    recommendations: ["优先选择轻资产OPC项目", "利用AI工具降低启动成本", "3个月内先跑通最小闭环"]
  };
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 分析API
app.post('/api/analyze', async (req, res) => {
  const { answers } = req.body;
  const requestId = crypto.randomUUID();

  if (!answers || Object.keys(answers).length < 10) {
    return res.status(400).json({ error: '请完成所有题目' });
  }

  for (const [qId, key] of Object.entries(answers)) {
    if (!VALID_KEYS.includes(key)) {
      return res.status(400).json({ error: `无效答案: ${key}` });
    }
  }

  if (!API_KEY) {
    return res.json(generateMockResults());
  }

  try {
    const answersText = Object.entries(answers)
      .map(([qId, key]) => `题目${qId}: 选择${key}`)
      .join('\n');

    const analysis = await callAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `用户OPC适配测试答案:\n${answersText}\n\n请给出分析报告。` }
    ], 1500);

    const scoreMatch = analysis.match(/(\d{2,3})/);
    const fitScore = scoreMatch ? parseInt(scoreMatch[1]) : 75;

    res.json({
      fit_score: fitScore,
      fit_level: fitScore >= 80 ? '高度适合' : fitScore >= 60 ? '适合' : fitScore >= 40 ? '中等' : '不太适合',
      full_analysis: analysis,
      summary: extractSummary(analysis),
      strengths: extractStrengths(analysis),
      weaknesses: extractWeaknesses(analysis),
      recommendations: extractRecommendations(analysis)
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error.message);
    res.status(500).json({ error: '分析服务暂时不可用' });
  }
});

// 生成完整手册API
app.post('/api/generate-manual', async (req, res) => {
  const { answers, results, manualProgress } = req.body;
  const requestId = crypto.randomUUID();

  // 如果没有API Key，返回示例手册
  if (!API_KEY) {
    const mockManual = generateMockManual(results);
    return res.json(mockManual);
  }

  try {
    const score = results?.fit_score || 75;
    const level = results?.fit_level || '待定';
    const summary = results?.summary || '';
    const strengths = results?.strengths?.join('、') || '';
    const weaknesses = results?.weaknesses?.join('、') || '';
    const recommendations = results?.recommendations?.join('、') || '';

    // 根据进度返回不同的部分
    const progress = manualProgress || 'part1';

    let content = '';
    let nextProgress = 'complete';

    switch (progress) {
      case 'part1':
        content = await generatePart1(score, level, summary, strengths, weaknesses);
        nextProgress = 'part2';
        break;
      case 'part2':
        content = await generatePart2(score, level, summary, strengths, weaknesses);
        nextProgress = 'part3';
        break;
      case 'part3':
        content = await generatePart3(score, level, summary, strengths, weaknesses);
        nextProgress = 'part4';
        break;
      case 'part4':
        content = await generatePart4(score, level, summary, strengths, weaknesses);
        nextProgress = 'complete';
        break;
      default:
        content = await generateFullManual(score, level, summary, strengths, weaknesses, recommendations);
        nextProgress = 'complete';
    }

    res.json({
      content,
      progress: nextProgress,
      complete: nextProgress === 'complete'
    });

  } catch (error) {
    console.error(`[${requestId}] Manual error:`, error.message);
    res.status(500).json({ error: '生成失败' });
  }
});

// 生成Part 1
async function generatePart1(score, level, summary, strengths, weaknesses) {
  const prompt = `你是OPC项目创始人教练。用户完成了OPC适配度测试，请生成「OPC适配度综合评估报告」。

用户数据：
- 适配度：${score}分 / ${level}
- 测试摘要：${summary}
- 优势：${strengths}
- 短板：${weaknesses}

请生成Part 1内容：

【一、OPC适配度综合评估】

1. 适配度评分解读
- 你的分数(${score})处于什么水平？
- ${level}意味着什么？
- 你的核心优势是什么？
- 你最需要改进的地方是什么？

2. 你的优势分析
基于你的测试结果，分析你的Top3优势：
- 优势1：[具体分析]
- 优势2：[具体分析]
- 优势3：[具体分析]
每个优势要说明：为什么这个优势能帮你在OPC路上成功？

3. 你的短板分析
基于你的测试结果，分析你的Top3短板：
- 短板1：[具体分析]
- 短板2：[具体分析]
- 短板3：[具体分析]
每个短板要说明：这个短板会如何拖你的后腿？

4. 个性化建议
基于你的优势和短板，给出3条具体可执行的建议。

格式要求：
- 简洁有力，直接给出结论
- 结合用户的具体情况，不要泛泛而谈
- 每部分有明确的小标题

字数要求：800-1000字`;

  return await callAI([
    { role: 'system', content: '你是一个OPC项目创始人教练，简洁专业，直接给结论。' },
    { role: 'user', content: prompt }
  ], 1200);
}

// 生成Part 2
async function generatePart2(score, level, summary, strengths, weaknesses) {
  const prompt = `你是OPC项目创始人教练。用户完成了OPC适配度测试，请生成「创始人12项素质深度评估」。

用户数据：
- 适配度：${score}分 / ${level}
- 优势：${strengths}
- 短板：${weaknesses}

请生成Part 2内容：

【二、创始人12项素质深度评估】

说明：每项素质有1分/3分/5分三个等级，1分代表完全不符合，3分代表基本符合，5分代表完全符合。

生存必备维度（每项5分，及格线9分）：
1. 极致现金流意识
   - 1分：先做产品再找客户，愿意投入3个月以上
   - 3分：无收入保持3个月生活备用金，项目上线3个月内有收入
   - 5分：保持6个月以上生活备用金，项目上线30天内产生正现金流

2. 无情优先级排序能力
   - 1分：每天做10件以上事，经常加班但没产出
   - 3分：每天列待办清单，优先做重要的事
   - 5分：每天只做3件能直接带来收入的事，其他全部推迟/拒绝/自动化

3. 拒绝的能力
   - 1分：不好意思拒绝任何人，免费帮别人解决问题
   - 3分：会拒绝大部分无关请求，但偶尔心软
   - 5分：明确拒绝所有免费咨询和无关合作，只做能带来收入的事

效率核心维度（每项5分，及格线9分）：
4. AI工具深度驾驭
   - 1分：只会用ChatGPT聊天，其他AI工具都不会
   - 3分：会用3种以上常用AI工具，能解决简单问题
   - 5分：能搭建完整AI工作流，用AI替代80%以上的重复工作

5. 产品化思维
   - 1分：只能卖时间做定制服务
   - 3分：有1个可重复销售的标准化产品
   - 5分：所有收入都来自可复制的产品，绝不接低价定制服务

6. 极简运营能力
   - 1分：自己开发所有工具，流程复杂，经常出问题
   - 3分：用现成SaaS工具，流程在5步以内
   - 5分：所有业务流程不超过3步，客户付款后自动交付

长期护城河维度（每项5分，及格线6分）：
7. 垂直领域深度积累
   - 1分：什么都做，没有明确的细分领域
   - 3分：有一个大致的方向，了解行业基本情况
   - 5分：专注于一个极小的细分领域，是该领域公认的专家

8. 私域流量运营能力
   - 1分：所有流量都依赖公域平台，没有私域
   - 3分：有一个私域列表，但很少维护
   - 5分：有1000人以上的精准私域，80%的收入来自老客户

9. 客户服务能力
   - 1分：客户问题很久才回复，态度冷淡
   - 3分：会及时回复客户问题，解决基本需求
   - 5分：亲自回复每一个客户，提供超出预期的服务

反脆弱维度（每项5分，及格线6分）：
10. 风险隔离能力
    - 1分：用个人名义做生意，个人资产和公司资产混同
    - 3分：注册了有限责任公司，但偶尔会混用资金
    - 5分：个人资产和公司资产完全分离，购买了必要的保险

11. 快速迭代能力
    - 1分：追求完美，产品做了半年还没上线
    - 3分：会做MVP，根据客户反馈偶尔迭代
    - 5分：错了就马上改，一个项目3个月不盈利就果断放弃

12. 心态与自律能力
    - 1分：作息混乱，经常拖延，遇到挫折就放弃
    - 3分：有基本的作息，能完成基本工作
    - 5分：有稳定的工作习惯，能忍受孤独，快速从失败中恢复

请根据用户的数据，分析他最可能在哪几项得高分，哪几项得低分，并给出个性化的提醒。

格式要求：
- 列出12项素质，每项有1/3/5分描述
- 明确每个维度的及格线
- 告诉用户如何计算总分（0-60分）
- 给出分数解读（0-20/21-40/41-50/51-60）
- 基于用户情况，指出他最可能在哪一项失分

字数要求：1200-1500字`;

  return await callAI([
    { role: 'system', content: '你是一个OPC项目创始人教练，简洁专业，直接给结论。' },
    { role: 'user', content: prompt }
  ], 1800);
}

// 生成Part 3
async function generatePart3(score, level, summary, strengths, weaknesses) {
  const prompt = `你是OPC项目创始人教练。用户完成了OPC适配度测试，请生成「优势发挥与短板改进策略」。

用户数据：
- 适配度：${score}分 / ${level}
- 优势：${strengths}
- 短板：${weaknesses}

请生成Part 3内容：

【三、优势发挥与短板改进策略】

一、你的Top3优势及如何发挥
基于你的测试结果，分析你的3个最强优势：
- 优势1：[优势名称]
  * 为什么这个优势能帮你在OPC路上成功？
  * 如何进一步发挥这个优势？
  * 具体行动清单

- 优势2：[优势名称]
  * 为什么这个优势能帮你在OPC路上成功？
  * 如何进一步发挥这个优势？
  * 具体行动清单

- 优势3：[优势名称]
  * 为什么这个优势能帮你在OPC路上成功？
  * 如何进一步发挥这个优势？
  * 具体行动清单

二、你的Top3短板及如何改进
基于你的测试结果，分析你最需要改进的3个短板：
- 短板1：[短板名称]
  * 这个短板会如何拖你的后腿？
  * 为什么这个短板很危险？
  * 如何快速改进？给出具体方法

- 短板2：[短板名称]
  * 这个短板会如何拖你的后腿？
  * 为什么这个短板很危险？
  * 如何快速改进？给出具体方法

- 短板3：[短板名称]
  * 这个短板会如何拖你的后腿？
  * 为什么这个短板很危险？
  * 如何快速改进？给出具体方法

三、扬长避短策略
- 你如何用优势弥补短板？
- 哪些事应该自己做？
- 哪些事应该交给AI或外包？
- 你的核心竞争力是什么？

四、个性化提升路径
基于你的综合情况，你的优先级排序是什么？
- 如果生存维度<9分：先集中解决现金流和优先级问题
- 如果效率维度<9分：先学会用AI工具提效
- 如果护城河维度<6分：先专注建立私域
- 如果反脆弱维度<6分：先调整心态和风险意识

格式要求：
- 每个部分都要结合用户的具体数据
- 优势发挥要给出具体的、可执行的行动
- 短板改进要给出"为什么"和"怎么做"
- 扬长避短要有明确的优先级排序

字数要求：1200-1500字`;

  return await callAI([
    { role: 'system', content: '你是一个OPC项目创始人教练，简洁专业，直接给结论。' },
    { role: 'user', content: prompt }
  ], 1800);
}

// 生成Part 4
async function generatePart4(score, level, summary, strengths, weaknesses, recommendations) {
  const prompt = `你是OPC项目创始人教练。用户完成了OPC适配度测试，请生成「第一周实战行动计划」。

用户数据：
- 适配度：${score}分 / ${level}
- 行动建议：${recommendations}

请生成Part 4内容：

【四、第一周实战行动计划】

一、定位确认（第1天）
基于你的优势和短板，确定你的OPC方向：
- 你最适合做什么？（结合你的优势）
- 你的最小细分领域是什么？
- 你的前10个潜在客户是谁？

产出物：写下你的OPC定位宣言（不超过50字）

二、产品设计（第2天）
设计你的第一个MVP（最小可行产品）：
- 你的第一个产品/服务是什么？
- 定价是多少？（参考：低价起步，验证后再调整）
- 如何交付？

产出物：写出你的产品介绍（不超过100字）

三、渠道探索（第3天）
找到你的前10个客户：
- 列出3个你最可能获客的渠道
- 每个渠道的具体接触方式是什么？
- 如何吸引他们？

产出物：列出前10个潜在客户名单

四、初步接触（第4-7天）
开始获得第一批反馈：
- 发送第一波推广信息
- 收集第一批客户反馈
- 根据反馈调整产品和策略

产出物：至少获得3个客户的回复

月度里程碑：
- 第1个月：获得前10个付费客户
- 第2个月：验证PMF，优化产品
- 第3个月：建立稳定收入流

风险预警：
- 最可能失败的3个原因
- 如何提前规避
- 如果失败了怎么办？

格式要求：
- 每天有具体任务和产出物
- 月度里程碑要可量化
- 风险预警要基于用户实际情况

字数要求：1000-1200字`;

  return await callAI([
    { role: 'system', content: '你是一个OPC项目创始人教练，简洁专业，直接给结论。' },
    { role: 'user', content: prompt }
  ], 1500);
}

// 生成完整手册（无API Key时）
function generateMockManual(results) {
  return {
    content: `【OPC项目完整手册】

一、OPC适配度综合评估

你的适配度为${results?.fit_score || 78}分，属于${results?.fit_level || '高度适合'}级别。

核心优势：
${results?.strengths?.map((s, i) => `${i+1}. ${s}`).join('\n') || '1. 动机强，行动力足\n2. 有一定副业经验\n3. 时间投入可保证'}

核心短板：
${results?.weaknesses?.map((w, i) => `${i+1}. ${w}`).join('\n') || '1. 资本储备不足\n2. 人脉资源有限\n3. 耐心需要加强'}

二、创始人12项素质深度评估

生存必备维度（及格线9分）：
- 现金流意识：你的优势在于有时间投入，但需要保持6个月备用金
- 优先级排序：需要每天只做3件最重要的事
- 拒绝能力：学会对免费咨询说不

效率核心维度（及格线9分）：
- AI工具：这是2026年最重要的能力，需要深度掌握
- 产品化思维：必须卖可复制的产品，不能卖时间
- 极简运营：用现成SaaS工具，不要自己开发

三、优势发挥与短板改进策略

Top3优势发挥：
1. 动机强 → 把这股劲用在获客上
2. 有经验 → 用已有经验快速验证
3. 时间投入 → 保证每天4小时专注工作

Top3短板改进：
1. 资本不足 → 先做轻资产项目，不要重投入
2. 人脉有限 → 从线上渠道开始，慢慢积累
3. 耐心不够 → 设置里程碑，用小步快跑代替大步试错

四、第一周实战行动计划

Day 1：定位确认
- 确定你的细分领域
- 写下你的定位宣言

Day 2：产品设计
- 设计你的第一个MVP
- 确定定价和交付方式

Day 3-7：初步接触
- 找到前10个潜在客户
- 发送第一波推广信息

月度里程碑：
- 获得前10个付费客户
- 验证PMF
- 建立稳定收入流

风险预警：
- 最可能失败：没有耐心、急于求成
- 如何规避：设置明确的止损点
`,
    progress: 'complete',
    complete: true
  };
}

app.listen(PORT, () => {
  console.log(`OPC API running on http://localhost:${PORT}`);
  console.log(`Model: deepseek-v4-flash (腾讯TokenHub)`);
});