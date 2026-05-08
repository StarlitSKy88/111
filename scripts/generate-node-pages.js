#!/usr/bin/env node
/**
 * 批量生成节点静态HTML页面
 * 按照节点02的设计规范
 */

const fs = require('fs');
const path = require('path');

const NODES_DIR = path.join(__dirname, '..', 'nodes');
const TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{summary}}">
  <meta name="theme-color" content="#111110">
  <title>{{title}} - OPC节点百科</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23111110'/><circle cx='16' cy='16' r='12' stroke='%23C0392B' stroke-width='1.5' fill='none'/><circle cx='16' cy='16' r='5' fill='%23C0392B'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #111110;
      --surface: #1A1A18;
      --text-primary: #F0EDE6;
      --text-secondary: #B8B4AE;
      --text-tertiary: #A8A49E;
      --accent: #C0392B;
      --line: #2A2A28;
      --line-light: rgba(255,255,255,0.06);
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
  </style>
</head>
<body>
  <div class="back-link">
    <a href="/"><span>←</span> 返回首页</a>
  </div>
  <div class="section-number">{{num}}</div>

  <div class="page">
    <header class="hero">
      <div class="hero-content">
        <div class="hero-label">节点 {{num}} · {{category}}</div>
        <h1 class="hero-title">{{title}}</h1>
        <p class="hero-desc">{{summary}}</p>
      </div>
    </header>

    <section class="content-section fade-section">
      <div class="section-label">节点内容</div>
      <h2 class="chapter-heading">{{subtitle}}</h2>
      <p class="body-text">{{description}}</p>
    </section>

    <footer class="footer-nav">
      <a href="/nodes/{{prevNode}}/index.html" class="nav-link">
        <span class="nav-arrow">←</span>
        {{prevTitle}}
      </a>
      <a href="/nodes/{{nextNode}}/index.html" class="nav-link">
        {{nextTitle}}
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

function padNumber(n) {
  return String(n).padStart(2, '0');
}

function getNodeInfo(id) {
  const dataPath = path.join(NODES_DIR, `${padNumber(id)}-*/data.json`);
  const matches = fs.readdirSync(NODES_DIR)
    .filter(d => d.match(new RegExp(`^${padNumber(id)}-`)))
    .map(d => path.join(NODES_DIR, d, 'data.json'))
    .filter(p => fs.existsSync(p));

  if (matches.length === 0) return null;

  try {
    const data = JSON.parse(fs.readFileSync(matches[0], 'utf-8'));
    return data;
  } catch (e) {
    return null;
  }
}

// Node IDs to process
const nodeIds = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];

let generated = 0;
let errors = 0;

for (const id of nodeIds) {
  const node = getNodeInfo(id);
  if (!node) {
    console.error(`Node ${id}: data.json not found`);
    errors++;
    continue;
  }

  const dirName = `${padNumber(id)}-${node.slug}`;
  const nodeDir = path.join(NODES_DIR, dirName);
  const outputPath = path.join(nodeDir, 'index.html');

  const prevId = id - 1;
  const nextId = id + 1;
  const prevNode = getNodeInfo(prevId);
  const nextNode = getNodeInfo(nextId);

  const html = TEMPLATE
    .replace(/\{\{num\}\}/g, padNumber(id))
    .replace(/\{\{title\}\}/g, node.title)
    .replace(/\{\{summary\}\}/g, node.summary || '')
    .replace(/\{\{category\}\}/g, node.category || '')
    .replace(/\{\{subtitle\}\}/g, node.title)
    .replace(/\{\{description\}\}/g, `本节点内容正在整理中，敬请期待。${node.summary || ''}`)
    .replace(/\{\{prevNode\}\}/g, prevNode ? `${padNumber(prevId)}-${prevNode.slug}` : '03-idea-validation')
    .replace(/\{\{prevTitle\}\}/g, prevNode ? `节点${padNumber(prevId)}：${prevNode.title}` : '节点03：创业想法筛选与验证')
    .replace(/\{\{nextNode\}\}/g, nextNode ? `${padNumber(nextId)}-${nextNode.slug}` : '39-government-policy')
    .replace(/\{\{nextTitle\}\}/g, nextNode ? `节点${padNumber(nextId)}：${nextNode.title}` : '节点39：政府政策与创业补贴');

  try {
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`Node ${id}: ${node.title} - Generated`);
    generated++;
  } catch (e) {
    console.error(`Node ${id}: Error writing file - ${e.message}`);
    errors++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Generated: ${generated}`);
console.log(`Errors: ${errors}`);
