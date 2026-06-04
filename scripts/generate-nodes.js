#!/usr/bin/env node
//
// ONE-MCN content-drafts -> nodes HTML generator (v2.0)
//
// 1. Read all 57 nodes from data/nodes.json (auto-derive prev/next via sorted ID)
// 2. Read 29 drafts from content-drafts/
// 3. Match by id (try 03.md, 03-slug.md, 03-slug-nospace.md)
// 4. Render via template (nodes/06-tech-selection/index.html)
// 5. Output to nodes/{id}-{slug}/index.html
//
// Usage:
//   node scripts/generate-nodes.js           # dry-run
//   node scripts/generate-nodes.js --apply   # write
//
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.join(__dirname, '..');
const NODES_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'nodes.json'), 'utf-8')).nodes;
const DRAFTS_DIR = path.join(ROOT, 'content-drafts');
const NODES_DIR = path.join(ROOT, 'nodes');

// Build full 57-node mapping (prev/next derived from sorted order)
const sortedNodes = [...NODES_DATA].sort((a, b) => a.id - b.id);
const nodesMap = {};
sortedNodes.forEach((n, i) => {
  const prev = sortedNodes[i - 1];
  const next = sortedNodes[i + 1];
  nodesMap[n.id] = {
    id: n.id,
    slug: n.slug,
    title: n.title,
    category: n.category,
    phase: n.category || '未分类',
    prevId: prev ? prev.id : null,
    prevSlug: prev ? prev.slug : null,
    nextId: next ? next.id : null,
    nextSlug: next ? next.slug : null
  };
});

console.log(`[1/4] Loaded ${Object.keys(nodesMap).length} nodes from data/nodes.json`);

// Read template
const templatePath = path.join(NODES_DIR, '06-tech-selection', 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error(`ERROR: template not found: ${templatePath}`);
  process.exit(1);
}
const template = fs.readFileSync(templatePath, 'utf-8');
const styleMatch = template.match(/<style>([\s\S]*?)<\/style>/);
const styles = styleMatch ? styleMatch[1] : '';

console.log(`[2/4] Template loaded: ${templatePath} (${template.length} bytes, ${styles.length} bytes of CSS)`);

// Parse markdown to HTML
function parseMarkdown(content, nodeId) {
  let html = content;
  const titleMatch = html.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : '';
  html = html.replace(/^# .+$/m, '');
  html = html.replace(/^> \*\*面向OPC\*\*：(.+)$/m, '<blockquote class="decision-box"><p>$1</p></blockquote>');
  html = html.replace(/^---$/gm, '');
  html = html.replace(/^## (.+)$/gm, (match, text) => `</section>\n<section id="s${text.charAt(0)}">\n      <div class="section-label">${text}</div>`);
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => `<pre><code>${code.trim()}</code></pre>`);
  html = html.replace(/\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
    const headers = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim() !== undefined).map(c => c.trim()).map((c, i) => c ? `<td>${c}</td>` : '').join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<div class="table-wrapper"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });
  html = html.replace(/((?:^- .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(item => {
      item = item.replace(/^-\s+/, '');
      item = item.replace(/🔴\s*P0/, '<span class="mark-cross">×</span> P0');
      item = item.replace(/🟠\s*P1/, 'P1');
      item = item.replace(/🟡\s*P2/, 'P2');
      item = item.replace(/🟢\s*P3/, '<span class="mark-check">✓</span> P3');
      item = item.replace(/✅/g, '<span class="mark-check">✓</span>');
      item = item.replace(/⚠️?/g, '<span class="mark-warn">⚠</span>');
      item = item.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
      return `<li>${item}</li>`;
    }).join('');
    return `<ul>${items}</ul>`;
  });
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(item => `<li>${item.replace(/^\d+\.\s+/, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });
  html = html.replace(/\[ \]/g, '<input type="checkbox" disabled>');
  html = html.replace(/\[x\]/gi, '<input type="checkbox" checked disabled>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^(?!<[a-z]|#|\/|div|table|section|h[1-4]|ul|ol|li|pre|blockquote)(.+)$/gm, '<p>$1</p>');
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/\n{3,}/g, '\n\n');
  return { html, title };
}

// Generate HTML for a node
function generateHTML(node, content) {
  const { html: contentHtml, title: extractedTitle } = parseMarkdown(content, node.id);
  const pageTitle = extractedTitle || `节点${node.id}：${node.title}`;
  const prevLink = node.prevId
    ? `<a href="/nodes/${node.prevId}-${node.prevSlug}/index.html" class="nav-link"><span>←</span> 节点${node.prevId}</a>`
    : `<span></span>`;
  const nextLink = node.nextId
    ? `<a href="/nodes/${node.nextId}-${node.nextSlug}/index.html" class="nav-link">节点${node.nextId} <span>→</span></a>`
    : `<span></span>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${pageTitle} - OPC节点百科">
  <meta name="theme-color" content="#111110">
  <title>${pageTitle} - OPC节点百科</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23111110'/><circle cx='16' cy='16' r='12' stroke='%23C0392B' stroke-width='1.5' fill='none'/><circle cx='16' cy='16' r='5' fill='%23C0392B'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
${styles}
  </style>
</head>
<body>
  <nav class="fixed-top-nav">
    <a href="/index.html" class="back-link">← 返回首页</a>
    <span class="node-id">节点 ${node.id} / 57</span>
  </nav>

  <div class="layout">
    <main class="container">
      <header>
      <div class="phase-label">${node.phase}</div>
      <h1>${pageTitle}</h1>
      <div class="node-meta">节点 ${node.id} / 57 · 最后修订：2026年6月4日</div>
    </header>

    <section id="s1">
    ${contentHtml}
    </section>

    <div class="summary-box">
      <h3>节点${node.id}检查清单</h3>
      <p>完成本节点后，请确认所有检查项已通过。</p>
    </div>
    </main>
  </div>

  <nav class="footer-nav">
    ${prevLink}
    ${nextLink}
  </nav>

  <script>
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });
  </script>
</body>
</html>`;
}

// Process each node
let generated = 0;
let skipped = 0;
let notFound = 0;
const errors = [];

console.log(`[3/4] Processing ${Object.keys(nodesMap).length} nodes...`);

for (const nodeId of Object.keys(nodesMap).sort((a, b) => +a - +b)) {
  const node = nodesMap[nodeId];

  // Try multiple naming patterns
  const possibleFiles = [
    path.join(DRAFTS_DIR, `${node.id}.md`),
    path.join(DRAFTS_DIR, `${node.id}-${node.slug}.md`),
    path.join(DRAFTS_DIR, `${node.id}-${node.slug.replace(/-/g, '')}.md`),
  ];

  let content = null;
  let matchedFile = null;
  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      content = fs.readFileSync(file, 'utf-8');
      matchedFile = file;
      break;
    }
  }

  if (!content) {
    notFound++;
    continue;
  }

  const html = generateHTML(node, content);
  if (!html) {
    errors.push(`Node ${nodeId}: generation failed`);
    continue;
  }

  const outputPath = path.join(NODES_DIR, `${node.id}-${node.slug}`, 'index.html');
  if (APPLY) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html, 'utf-8');
  }
  generated++;
  if (generated <= 5 || generated % 10 === 0) {
    console.log(`  ✓ ${path.basename(matchedFile)} -> ${path.relative(ROOT, outputPath)}`);
  }
}

console.log(`[4/4] ${APPLY ? 'APPLIED' : 'DRY-RUN'}`);
console.log('='.repeat(60));
console.log(`Generated: ${generated}`);
console.log(`Not found: ${notFound} (no .md draft for this node)`);
console.log(`Errors:    ${errors.length}`);
if (errors.length) errors.forEach(e => console.log(`  - ${e}`));
console.log('='.repeat(60));
if (!APPLY && generated > 0) {
  console.log('Run with --apply to write to nodes/');
}
