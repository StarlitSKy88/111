#!/usr/bin/env node
/**
 * 批量生成节点静态HTML页面
 * 读取 index.md 内容并生成完整的 HTML 页面
 */

const fs = require('fs');
const path = require('path');
const marked = require('marked');

const NODES_DIR = path.join(__dirname, '..', 'nodes');

// 设计规范样式（与节点02一致）
const STYLES = `
:root {
  --bg: #111110;
  --surface: #1A1A18;
  --text-primary: #F0EDE6;
  --text-secondary: #B8B4AE;
  --text-tertiary: #A8A49E;
  --accent: #C0392B;
  --line: #2A2A28;
  --line-light: rgba(255,255,255,0.06);

  /* 间距系统 */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
  --space-xl: 48px;
  --space-2xl: 64px;
  --space-3xl: 96px;
  --space-4xl: 128px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 400;
  line-height: 1.9;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: antialiased;
}

.page {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(24px, 8vw, 120px);
  min-height: 100vh;
}

.page::before {
  content: '';
  position: absolute;
  top: 0;
  left: clamp(24px, 8vw, 120px);
  right: clamp(24px, 8vw, 120px);
  height: 1px;
  background: var(--line);
}

.section-number {
  position: absolute;
  top: var(--space-2xl);
  right: clamp(24px, 8vw, 120px);
  font-size: clamp(100px, 22vw, 280px);
  font-weight: 100;
  color: var(--text-primary);
  opacity: 0.03;
  line-height: 1;
  letter-spacing: -0.05em;
  font-family: 'Noto Serif JP', serif;
  pointer-events: none;
  user-select: none;
}

.back-link {
  position: fixed;
  top: var(--space-xl);
  left: clamp(24px, 8vw, 120px);
  z-index: 100;
}

.back-link a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-link a:hover { color: var(--text-primary); }

.hero {
  padding: var(--space-4xl) 0 var(--space-3xl);
  position: relative;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.hero-label {
  font-size: 11px;
  color: var(--accent);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.hero-label::before {
  content: '';
  width: 32px;
  height: 1px;
  background: var(--accent);
}

.hero-title {
  font-family: 'Noto Serif JP', serif;
  font-size: clamp(48px, 10vw, 96px);
  font-weight: 300;
  letter-spacing: -0.03em;
  line-height: 0.95;
  margin-bottom: var(--space-xl);
}

.hero-desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 44ch;
}

.content-section {
  padding: var(--space-3xl) 0;
  border-top: 1px solid var(--line);
}

.section-label {
  font-size: 11px;
  color: var(--accent);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.section-label::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--accent);
}

.grid-asymmetric {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--space-3xl);
  align-items: start;
}

@media (max-width: 900px) {
  .grid-asymmetric {
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
  }
}

.chapter-heading {
  font-family: 'Noto Serif JP', serif;
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: var(--space-xl);
  max-width: 16em;
}

.body-text {
  font-size: 15px;
  line-height: 1.9;
  color: var(--text-secondary);
  max-width: 44ch;
  margin-bottom: var(--space-md);
}

.body-text strong { color: var(--text-primary); font-weight: 500; }
.body-text .accent { color: var(--accent); font-weight: 500; }

.quote-block {
  padding-left: var(--space-md);
  border-left: 1px solid var(--accent);
  margin: var(--space-xl) 0;
}

.quote-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
  max-width: 40ch;
}

.insight-tag {
  display: inline-block;
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: var(--space-lg);
  border: 1px solid var(--accent);
  padding: 4px 12px;
}

.data-card {
  background: var(--surface);
  border: 1px solid var(--line);
}

.data-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--line);
}

.data-card-row:last-child { border-bottom: none; }

.data-label {
  font-size: 12px;
  color: var(--text-tertiary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.data-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.data-value.accent { color: var(--accent); font-weight: 600; }

.list-item {
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--line);
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: var(--space-lg);
}

.list-item:last-child { border-bottom: none; }

.list-num {
  font-family: 'Noto Serif JP', serif;
  font-size: 32px;
  font-weight: 300;
  color: var(--text-tertiary);
  line-height: 1;
}

.list-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.list-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 40ch;
}

.core-insight {
  margin: var(--space-xl) 0;
  padding-left: var(--space-md);
  border-left: 1px solid var(--accent);
}

.core-insight-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 40ch;
}

.balance-section-title {
  font-family: 'Noto Serif JP', serif;
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 300;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-xl);
}

.balance-intro {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 46ch;
  margin-bottom: var(--space-2xl);
}

.balance-intro strong { color: var(--text-primary); font-weight: 500; }

.balance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
}

@media (max-width: 768px) {
  .balance-grid { grid-template-columns: 1fr; gap: var(--space-xl); }
}

.balance-card {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: var(--space-lg);
}

.balance-card-label {
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--line);
}

.balance-card-label.positive { color: var(--accent); }
.balance-card-label.negative { color: var(--text-tertiary); }

.balance-item {
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--line-light);
  font-size: 14px;
  color: var(--text-secondary);
}

.balance-item:last-child { border-bottom: none; }
.balance-item.dim { color: var(--text-tertiary); }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
}

@media (max-width: 900px) {
  .summary-grid { grid-template-columns: 1fr; gap: var(--space-lg); }
}

.summary-card {
  padding: var(--space-lg) 0;
  border-top: 1px solid var(--line);
}

.summary-num {
  font-family: 'Noto Serif JP', serif;
  font-size: 36px;
  font-weight: 300;
  color: var(--accent);
  margin-bottom: var(--space-sm);
}

.summary-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.summary-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.footer-nav {
  padding: var(--space-2xl) 0;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.nav-link:hover { color: var(--text-primary); }
.nav-arrow { font-size: 0.75rem; }

.fade-section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-section.visible { opacity: 1; transform: translateY(0); }

* { transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); }

/* Markdown 内容样式 */
.markdown-content h1 {
  font-family: 'Noto Serif JP', serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: var(--space-xl);
  color: var(--text-primary);
}

.markdown-content h2 {
  font-family: 'Noto Serif JP', serif;
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: var(--space-xl) 0 var(--space-lg);
  color: var(--text-primary);
}

.markdown-content h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin: var(--space-lg) 0 var(--space-sm);
}

.markdown-content p {
  font-size: 15px;
  line-height: 1.9;
  color: var(--text-secondary);
  max-width: 44ch;
  margin-bottom: var(--space-md);
}

.markdown-content ul, .markdown-content ol {
  margin: var(--space-lg) 0;
  padding-left: var(--space-xl);
}

.markdown-content li {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.markdown-content li strong { color: var(--text-primary); }

.markdown-content blockquote {
  padding-left: var(--space-md);
  border-left: 1px solid var(--accent);
  margin: var(--space-xl) 0;
}

.markdown-content blockquote p {
  font-size: 16px;
  color: var(--text-secondary);
}

.markdown-content pre {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: var(--space-lg);
  margin: var(--space-xl) 0;
  overflow-x: auto;
}

.markdown-content code {
  font-family: 'Geist Mono', monospace;
  font-size: 13px;
  color: var(--text-primary);
}

.markdown-content hr {
  border: 0;
  border-top: 1px solid var(--line);
  margin: var(--space-2xl) 0;
}

.markdown-content a {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid var(--accent);
}

.markdown-content a:hover { opacity: 0.7; }
`;

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true
});

function padNumber(n) {
  return String(n).padStart(2, '0');
}

function getNodeData(id) {
  const dataPath = path.join(NODES_DIR, `${padNumber(id)}-*/data.json`);
  const matches = fs.readdirSync(NODES_DIR)
    .filter(d => d.match(new RegExp(`^${padNumber(id)}-`)))
    .map(d => path.join(NODES_DIR, d, 'data.json'))
    .filter(p => fs.existsSync(p));

  if (matches.length === 0) return null;

  try {
    return JSON.parse(fs.readFileSync(matches[0], 'utf-8'));
  } catch (e) {
    return null;
  }
}

function getAllNodeDirs() {
  return fs.readdirSync(NODES_DIR)
    .filter(d => d.match(/^\d{2}-/))
    .sort()
    .map(d => path.join(NODES_DIR, d));
}

function slugToId(slug) {
  const match = slug.match(/^(\d+)-/);
  return match ? parseInt(match[1]) : null;
}

function generatePage(nodeDir) {
  const dirName = path.basename(nodeDir);
  const id = slugToId(dirName);

  // 读取 data.json
  const dataPath = path.join(nodeDir, 'data.json');
  if (!fs.existsSync(dataPath)) return false;

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 读取 index.md
  const mdPath = path.join(nodeDir, 'index.md');
  let contentHtml = '<p>内容正在整理中...</p>';

  if (fs.existsSync(mdPath)) {
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    // 提取"当前内容"部分（跳过需求文档）
    const currentContentMatch = mdContent.match(/## 当前内容([\s\S]*?)(?=### 相关资源|## 相关资源|$)/);
    const contentSection = currentContentMatch ? currentContentMatch[1] : mdContent;

    // 转换 markdown 为 HTML
    contentHtml = marked.parse(contentSection);
  }

  // 获取前后节点
  const prevId = id - 1;
  const nextId = id + 1;
  const prevNode = getNodeData(prevId);
  const nextNode = getNodeData(nextId);

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${data.summary || ''}">
  <meta name="theme-color" content="#111110">
  <title>${data.title} - OPC节点百科</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23111110'/><circle cx='16' cy='16' r='12' stroke='%23C0392B' stroke-width='1.5' fill='none'/><circle cx='16' cy='16' r='5' fill='%23C0392B'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
${STYLES}
  </style>
</head>
<body>
  <div class="back-link">
    <a href="/"><span>←</span> 返回首页</a>
  </div>
  <div class="section-number">${padNumber(id)}</div>

  <div class="page">
    <header class="hero">
      <div class="hero-content">
        <div class="hero-label">节点 ${padNumber(id)} · ${data.category || '0-1'}</div>
        <h1 class="hero-title">${data.title}</h1>
        <p class="hero-desc">${data.summary || ''}</p>
      </div>
    </header>

    <section class="content-section fade-section">
      <div class="section-label">节点内容</div>
      <div class="markdown-content">
        ${contentHtml}
      </div>
    </section>

    <footer class="footer-nav">
      <a href="/nodes/${prevNode ? `${padNumber(prevId)}-${prevNode.slug}` : '03-idea-validation'}/index.html" class="nav-link">
        <span class="nav-arrow">←</span>
        ${prevNode ? `节点${padNumber(prevId)}：${prevNode.title}` : '节点03：创业想法筛选与验证'}
      </a>
      <a href="/nodes/${nextNode ? `${padNumber(nextId)}-${nextNode.slug}` : '39-government-policy'}/index.html" class="nav-link">
        ${nextNode ? `节点${padNumber(nextId)}：${nextNode.title}` : '节点39：政府政策与创业补贴'}
        <span class="nav-arrow">→</span>
      </a>
    </footer>
  </div>

  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-section').forEach(el => observer.observe(el));
  </script>
</body>
</html>`;

  const outputPath = path.join(nodeDir, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf-8');
  return true;
}

// 主程序
const nodeDirs = getAllNodeDirs();
let generated = 0;
let errors = 0;

for (const nodeDir of nodeDirs) {
  const dirName = path.basename(nodeDir);
  const id = slugToId(dirName);

  if (!id || id < 4 || id > 38) {
    // 跳过节点01-03和39-40
    continue;
  }

  try {
    if (generatePage(nodeDir)) {
      console.log(`Node ${id}: ${dirName} - Generated`);
      generated++;
    } else {
      console.error(`Node ${id}: Failed to generate`);
      errors++;
    }
  } catch (e) {
    console.error(`Node ${id}: Error - ${e.message}`);
    errors++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Generated: ${generated}`);
console.log(`Errors: ${errors}`);