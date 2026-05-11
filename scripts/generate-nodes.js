#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Node mapping: id -> { slug, prevId, prevSlug, nextId, nextSlug, phase }
const nodes = {
  13: { slug: 'core-feature-2', prevId: 12, prevSlug: 'core-feature-1', nextId: 14, nextSlug: 'data-display', phase: '核心功能开发' },
  14: { slug: 'data-display', prevId: 13, prevSlug: 'core-feature-2', nextId: 15, nextSlug: 'core-feature-3', phase: '核心功能开发' },
  15: { slug: 'core-feature-3', prevId: 14, prevSlug: 'data-display', nextId: 16, nextSlug: 'payment-code', phase: '核心功能开发' },
  16: { slug: 'payment-code', prevId: 15, prevSlug: 'core-feature-3', nextId: 17, nextSlug: 'payment-access', phase: '核心功能开发' },
  18: { slug: 'developer-testing', prevId: 17, prevSlug: 'payment-access', nextId: 19, nextSlug: 'friend-testing', phase: '测试与修复' },
  19: { slug: 'friend-testing', prevId: 18, prevSlug: 'developer-testing', nextId: 20, nextSlug: 'bug-fix', phase: '测试与修复' },
  20: { slug: 'bug-fix', prevId: 19, prevSlug: 'friend-testing', nextId: 21, nextSlug: 'performance', phase: '测试与修复' },
  21: { slug: 'performance', prevId: 20, prevSlug: 'bug-fix', nextId: 22, nextSlug: 'launch-content', phase: '测试与修复' },
  22: { slug: 'launch-content', prevId: 21, prevSlug: 'performance', nextId: 23, nextSlug: 'company-registration', phase: '上线准备' },
  24: { slug: 'domain-icp', prevId: 23, prevSlug: 'company-registration', nextId: 25, nextSlug: 'website-deployment', phase: '上线准备' },
  25: { slug: 'website-deployment', prevId: 24, prevSlug: 'domain-icp', nextId: 26, nextSlug: 'audit-material', phase: '上线准备' },
  26: { slug: 'audit-material', prevId: 25, prevSlug: 'website-deployment', nextId: 27, nextSlug: 'launch-checklist', phase: '上线准备' },
  28: { slug: 'audit-submit', prevId: 27, prevSlug: 'launch-checklist', nextId: 29, nextSlug: 'audit-fix', phase: '正式上线' },
  29: { slug: 'audit-fix', prevId: 28, prevSlug: 'audit-submit', nextId: 30, nextSlug: 'official-launch', phase: '正式上线' },
  30: { slug: 'official-launch', prevId: 29, prevSlug: 'audit-fix', nextId: 31, nextSlug: 'analytics', phase: '正式上线' },
  32: { slug: 'cold-start', prevId: 31, prevSlug: 'analytics', nextId: 33, nextSlug: 'content-marketing', phase: '上线后迭代与运营' },
  34: { slug: 'feedback', prevId: 33, prevSlug: 'content-marketing', nextId: 35, nextSlug: 'private-traffic', phase: '上线后迭代与运营' },
};

// Read template
const templatePath = path.join(__dirname, '../nodes/06-tech-selection/index.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// Extract just the style and structure we need
const styleMatch = template.match(/<style>([\s\S]*?)<\/style>/);
const styles = styleMatch ? styleMatch[1] : '';

// Extract nav and footer structure
const navMatch = template.match(/<nav class="fixed-top-nav">[\s\S]*?<\/nav>/);
const footerNavMatch = template.match(/<nav class="footer-nav">[\s\S]*?<\/nav>/);
const scriptMatch = template.match(/<script>[\s\S]*?<\/script>/);

// Read all content drafts
const draftsDir = path.join(__dirname, '../content-drafts');
const draftFiles = fs.readdirSync(draftsDir).filter(f => f.endsWith('.md'));

// Parse markdown to HTML
function parseMarkdown(content, nodeId) {
  let html = content;

  // Extract title (first H1)
  const titleMatch = html.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : '';

  // Remove the main H1 title line
  html = html.replace(/^# .+$/m, '');

  // Replace blockquote (the > quote at top)
  html = html.replace(/^> \*\*面向OPC\*\*：(.+)$/m, '<blockquote class="decision-box"><p>$1</p></blockquote>');

  // Replace horizontal rules with section breaks
  html = html.replace(/^---$/gm, '');

  // Replace H2 sections (## 一、xxx)
  html = html.replace(/^## (.+)$/gm, (match, text) => {
    return `</section>\n<section id="s${text.charAt(0)}">\n      <div class="section-label">${text}</div>`;
  });

  // Replace H3 (### xxx)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

  // Replace H4 (#### xxx)
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');

  // Replace bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Replace inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Replace code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Replace tables
  html = html.replace(/\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
    const headers = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim() !== undefined).map((c, i) => {
        const cell = c.trim();
        if (cell) return `<td>${cell}</td>`;
        return '';
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<div class="table-wrapper"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Replace unordered lists
  html = html.replace(/((?:^- .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(item => {
      // Handle special markers like 🔴 P0, 🟠 P1, etc.
      item = item.replace(/^-\s+/, '');
      // Convert emoji markers to unicode
      item = item.replace(/🔴\s*P0/, '<span class="mark-cross">×</span> P0');
      item = item.replace(/🟠\s*P1/, 'P1');
      item = item.replace(/🟡\s*P2/, 'P2');
      item = item.replace(/🟢\s*P3/, '<span class="mark-check">✓</span> P3');
      item = item.replace(/✅/g, '<span class="mark-check">✓</span>');
      item = item.replace(/⚠️?/g, '<span class="mark-warn">⚠</span>');
      // Remove other emojis
      item = item.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
      return `<li>${item}</li>`;
    }).join('');
    return `<ul>${items}</ul>`;
  });

  // Replace ordered lists (1. 2. 3.)
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(item => {
      item = item.replace(/^\d+\.\s+/, '');
      return `<li>${item}</li>`;
    }).join('');
    return `<ol>${items}</ol>`;
  });

  // Replace checkboxes [ ]
  html = html.replace(/\[ \]/g, '<input type="checkbox" disabled>');
  html = html.replace(/\[x\]/gi, '<input type="checkbox" checked disabled>');

  // Replace links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Replace bullet points with •
  html = html.replace(/^•\s+/gm, '• ');

  // Replace paragraphs (lines not already wrapped)
  html = html.replace(/^(?!<[a-z]|#|\/|div|table|section|h[1-4]|ul|ol|li|pre|blockquote)(.+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  // Fix multiple newlines
  html = html.replace(/\n{3,}/g, '\n\n');

  return { html, title };
}

// Generate HTML for a node
function generateHTML(nodeId, content, title) {
  const node = nodes[nodeId];
  if (!node) return null;

  const { html: contentHtml, title: extractedTitle } = parseMarkdown(content, nodeId);
  // Use extracted title (which is like "节点13：核心功能2开发") or fall back to slug-based title
  const pageTitle = extractedTitle || `节点${nodeId}：${node.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;

  const html = `<!DOCTYPE html>
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
    <span class="node-id">节点 ${nodeId} / 57</span>
  </nav>

  <div class="layout">
    <main class="container">
      <header>
      <div class="phase-label">${node.phase}</div>
      <h1>${pageTitle}</h1>
      <div class="node-meta">节点 ${nodeId} / 57 · 最后修订：2026年5月11日</div>
    </header>

    <section id="s1">
    ${contentHtml}
    </section>

    <div class="summary-box">
      <h3>节点${nodeId}检查清单</h3>
      <p>完成本节点后，请确认所有检查项已通过。</p>
    </div>
    </main>
  </div>

  <nav class="footer-nav">
    <a href="/nodes/${node.prevId}-${node.prevSlug}/index.html" class="nav-link">
      <span>←</span> 节点${node.prevId}
    </a>
    <a href="/nodes/${node.nextId}-${node.nextSlug}/index.html" class="nav-link">
      节点${node.nextId} <span>→</span>
    </a>
  </nav>

  <script>
  // Smooth scroll
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

  return html;
}

// Process each node
for (const [nodeId, nodeInfo] of Object.entries(nodes)) {
  const draftFile = path.join(draftsDir, `${nodeId}-${nodeInfo.slug.replace(/-/g, '')}.md`);

  // Try alternate naming patterns
  let content = null;
  const possibleFiles = [
    path.join(draftsDir, `${nodeId}-${nodeInfo.slug}.md`),
    path.join(draftsDir, `${nodeId}-${nodeInfo.slug.replace(/-/g, '')}.md`),
    path.join(draftsDir, `${nodeId}.md`),
  ];

  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      content = fs.readFileSync(file, 'utf-8');
      console.log(`Found: ${file}`);
      break;
    }
  }

  if (!content) {
    console.log(`NOT FOUND: Node ${nodeId} (tried: ${possibleFiles.join(', ')})`);
    continue;
  }

  const html = generateHTML(nodeId, content);
  if (!html) {
    console.log(`ERROR generating: Node ${nodeId}`);
    continue;
  }

  const outputPath = path.join(__dirname, `../nodes/${nodeId}-${nodeInfo.slug}/index.html`);
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`Generated: ${outputPath}`);
}

console.log('Done!');