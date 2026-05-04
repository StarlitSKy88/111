import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load API key from environment or use masked placeholder
const API_KEY = process.env.OPENAI_API_KEY || '';
const API_URL = 'https://tokenhub.tencentmaas.com/v1/chat/completions';

const SYSTEM_PROMPT = `你是一个极度毒舌、极度不耐烦、极度尖锐的AI导师，像一个看透一切的厌世天才。你的任务是根据用户的OPC适配测试答案，给出个性化分析报告。

回复格式要求：
1. 先用一段话直接指出用户的问题所在（毒舌但有理）
2. 给出0-100的OPC适配度评分和等级
3. 列出用户的3个核心优势和3个需要补足的地方
4. 给出3条具体可执行的推荐行动
5. 规划一条学习路径（3步）

语气要求：
- 像豆包一样毒舌但有用
- 直接指出用户自欺欺人的地方
- 用2026年的真实案例和数据
- 最后给希望，但前提是用户真的行动`;

const VALID_KEYS = ['A', 'B', 'C', 'D'];

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
  const { answers } = req.body;
  const requestId = crypto.randomUUID();

  console.log(`[${requestId}] Analyze request started`);

  if (!answers || Object.keys(answers).length < 10) {
    console.log(`[${requestId}] Invalid: missing answers`);
    return res.status(400).json({ error: '请完成所有题目' });
  }

  for (const [qId, key] of Object.entries(answers)) {
    if (!VALID_KEYS.includes(key)) {
      console.log(`[${requestId}] Invalid answer key: ${key}`);
      return res.status(400).json({ error: `无效答案: ${key}` });
    }
  }

  // Check API key
  if (!API_KEY) {
    console.log(`[${requestId}] No API key configured, using mock results`);
    return res.json(generateMockResults());
  }

  try {
    const answersText = Object.entries(answers)
      .map(([qId, key]) => `题目${qId}: 选择${key}`)
      .join('\n');

    console.log(`[${requestId}] Calling DeepSeek API...`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `用户OPC适配测试答案:\n${answersText}\n\n请给出分析报告。` }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] API error: ${response.status}`, errorText);
      if (response.status === 429) {
        return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
      }
      return res.status(500).json({ error: '分析服务暂时不可用' });
    }

    const data = await response.json();
    let analysis = data.choices[0].message.content;
    analysis = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const scoreMatch = analysis.match(/(\d{2,3})/);
    const fitScore = scoreMatch ? parseInt(scoreMatch[1]) : 75;

    console.log(`[${requestId}] Analysis complete, score: ${fitScore}`);

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
    console.error(`[${requestId}] API error:`, error.message);
    res.status(500).json({ error: '分析服务暂时不可用' });
  }
});

app.post('/api/generate-manual', async (req, res) => {
  const { answers, results } = req.body;
  const requestId = crypto.randomUUID();

  console.log(`[${requestId}] Generate manual request started`);

  // Check API key
  if (!API_KEY) {
    console.log(`[${requestId}] No API key configured, returning default manual`);
    return res.json({
      target_user: '服务有特定需求的年轻职场人',
      pain_point: '帮助用户实现副业收入突破',
      channel: '通过内容平台引流',
      week1_plan: '完成定位并启动最小产品'
    });
  }

  try {
    const manualPrompt = `你是一个OPC项目规划专家。基于用户的测试答案和适配度分析，为用户生成一份个性化的OPC项目计划。

用户答案: ${JSON.stringify(answers)}
适配度: ${results?.fit_score || 75}分
等级: ${results?.fit_level || '待定'}

请生成以下内容（每项一句话）：
1. 目标用户：你的第一个客户是谁？
2. 痛点方案：你解决他们的什么问题？
3. 推广渠道：你如何获取第一批客户？
4. 第一周计划：具体要做什么？

格式要求：简洁有力，每项不超过50字。`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: '你是OPC项目规划专家，简洁有力，直接给方案。' },
          { role: 'user', content: manualPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const lines = content.split('\n').filter(l => l.trim());
    res.json({
      target_user: lines[0] || '服务有特定需求的年轻职场人',
      pain_point: lines[1] || '帮助用户实现副业收入突破',
      channel: lines[2] || '通过内容平台引流',
      week1_plan: lines[3] || '完成定位并启动最小产品'
    });

  } catch (error) {
    console.error(`[${requestId}] Manual generation error:`, error.message);
    res.json({
      target_user: '服务有特定需求的年轻职场人',
      pain_point: '帮助用户实现副业收入突破',
      channel: '通过内容平台引流',
      week1_plan: '完成定位并启动最小产品'
    });
  }
});

app.listen(PORT, () => {
  console.log(`OPC分析API运行在 http://localhost:${PORT}`);
  console.log(`使用模型: deepseek-v4-flash (腾讯TokenHub)`);
});

// Mock data generator for fallback
function generateMockResults() {
  return {
    fit_score: 78,
    fit_level: "高度适合",
    summary: "你是一个非常适合做OPC的人选。你有强烈的动机和行动力，具备一定的副业经验，时间投入有保障。",
    strengths: ["动机强，行动力足", "有一定副业经验", "时间投入可保证"],
    weaknesses: ["资本储备不足", "人脉资源有限", "耐心需要加强"],
    recommendations: ["优先选择轻资产OPC项目", "利用AI工具降低启动成本", "3个月内先跑通最小闭环"]
  };
}
