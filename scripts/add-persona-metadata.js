#!/usr/bin/env node
//
// ONE-MCN content-drafts persona metadata injection
//
// Add YAML frontmatter to all .md files in content-drafts/:
//   ---
//   node_id: 03
//   persona: azhe            # azhe | ranmu | neutral
//   cta_type: course         # course | wechat | consult
//   keywords: [problem, mvp]
//   ---
//
// Rules:
// - 1-3 节点 → azhe (理性/反常识/技术流)
// - 4-10 节点 → ranmu (感性/反差/成长流)
// - 11-57 节点 → neutral (中性)
// - cta_type 推断：从 draft 内容匹配
//
// Usage:
//   node scripts/add-persona-metadata.js          # dry-run
//   node scripts/add-persona-metadata.js --apply  # write
//
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const DRAFTS_DIR = path.join(__dirname, '..', 'content-drafts');

// Keywords for cta_type inference
const CTA_RULES = [
  { cta: 'course', weight: 0, kw: ['课程', '训练营', '教程', '实操', '教学'] },
  { cta: 'wechat', weight: 0, kw: ['微信', '加微', '加好友', '社群', '私信', '答疑'] },
  { cta: 'consult', weight: 0, kw: ['1v1', '咨询', '顾问', '诊断', '陪跑'] },
];

function inferCta(content) {
  const scores = { course: 0, wechat: 0, consult: 0 };
  for (const rule of CTA_RULES) {
    for (const kw of rule.kw) {
      const matches = (content.match(new RegExp(kw, 'g')) || []).length;
      scores[rule.cta] += matches;
    }
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function inferKeywords(content) {
  // Pick 3-5 most frequent CJK words (length 2-4) excluding common stopwords
  const stopwords = new Set([
    '一个', '可以', '没有', '我们', '你们', '他们', '这个', '那个', '什么',
    '因为', '所以', '但是', '如果', '虽然', '然后', '现在', '需要', '应该',
    '节点', '内容', '问题', '东西', '时候', '这样', '那样', '或者', '以及',
    '已经', '可能', '不会', '通过', '进行', '开始', '完成', '使用', '选择'
  ]);
  const wordCount = {};
  const matches = content.match(/[一-龥]{2,4}/g) || [];
  for (const word of matches) {
    if (stopwords.has(word)) continue;
    wordCount[word] = (wordCount[word] || 0) + 1;
  }
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
}

function inferPersona(nodeId) {
  if (nodeId <= 3) return 'azhe';
  if (nodeId >= 4 && nodeId <= 10) return 'ranmu';
  return 'neutral';
}

function processFile(filePath) {
  const fileName = path.basename(filePath);
  const idMatch = fileName.match(/^(\d+)/);
  if (!idMatch) return null;
  const nodeId = parseInt(idMatch[1]);

  const content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has frontmatter
  if (content.startsWith('---\n')) return null;

  const persona = inferPersona(nodeId);
  const cta = inferCta(content);
  const keywords = inferKeywords(content);

  const frontmatter = `---
node_id: ${nodeId}
persona: ${persona}
cta_type: ${cta}
keywords: [${keywords.join(', ')}]
---\n\n`;

  if (APPLY) {
    fs.writeFileSync(filePath, frontmatter + content, 'utf-8');
  }
  return { nodeId, persona, cta, keywords: keywords.length };
}

const files = fs.readdirSync(DRAFTS_DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => path.join(DRAFTS_DIR, f));

console.log('='.repeat(60));
console.log(`Content-drafts persona metadata ${APPLY ? '(APPLY)' : '(DRY-RUN)'}`);
console.log('='.repeat(60));

let processed = 0;
let skipped = 0;
const stats = { azhe: 0, ranmu: 0, neutral: 0 };
const ctaStats = { course: 0, wechat: 0, consult: 0 };

for (const f of files) {
  const result = processFile(f);
  if (!result) { skipped++; continue; }
  stats[result.persona]++;
  ctaStats[result.cta]++;
  processed++;
  if (processed <= 3) {
    console.log(`  ✓ ${path.basename(f)} → persona=${result.persona}, cta=${result.cta}, kw=${result.keywords}`);
  }
}

console.log('='.repeat(60));
console.log(`Processed: ${processed}`);
console.log(`Skipped:   ${skipped} (already has frontmatter or unparseable)`);
console.log(`Persona:   azhe=${stats.azhe}, ranmu=${stats.ranmu}, neutral=${stats.neutral}`);
console.log(`CTA:       course=${ctaStats.course}, wechat=${ctaStats.wechat}, consult=${ctaStats.consult}`);
if (!APPLY && processed > 0) {
  console.log();
  console.log('Run with --apply to write frontmatter.');
}
