#!/usr/bin/env node

/**
 * OPC节点百科3.0 - 数据迁移脚本
 * 将 nodes.json 拆分为 40 个独立的子项目目录
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NODES_DIR = path.join(ROOT, 'nodes');
const SRC_DATA = path.join(ROOT, 'data', 'nodes.json');

function padNumber(n) {
  return String(n).padStart(2, '0');
}

function escapeTemplate(str) {
  return str.replace(/`/g, '\\`');
}

async function migrate() {
  console.log('🚀 开始迁移...\n');

  // 读取源数据
  const data = JSON.parse(fs.readFileSync(SRC_DATA, 'utf-8'));
  console.log(`📊 找到 ${data.nodes.length} 个节点\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const node of data.nodes) {
    const dirName = `${padNumber(node.id)}-${node.slug}`;
    const nodeDir = path.join(NODES_DIR, dirName);

    try {
      // 创建目录
      fs.mkdirSync(nodeDir, { recursive: true });

      // 写入 data.json
      fs.writeFileSync(
        path.join(nodeDir, 'data.json'),
        JSON.stringify(node, null, 2)
      );

      // 写入 index.md
      const md = `# ${node.title}

## 需求文档

### 基本信息
- **节点ID**: ${padNumber(node.id)}
- **slug**: ${node.slug}
- **分类**: ${node.category}
- **难度**: ${node.difficulty}
- **咨询价格**: ¥${node.price_consult || 0}

### 功能需求
1. [待填写 - AI 根据需求生成]

### 验收标准
- [ ] 标准1
- [ ] 标准2

## 当前内容

### 概述
${node.summary}

### 详细说明
（AI 生成内容放置于此）

### 相关资源
- [资源链接占位符]

---

*本文档由 VibCoding 工作流管理*
*创建时间: ${new Date().toISOString()}*
*版本: v1.0*`;

      fs.writeFileSync(path.join(nodeDir, 'index.md'), md);

      // 写入 index.html（静态入口）
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeTemplate(node.summary)}">
  <meta name="theme-color" content="#111110">
  <title>${node.title} - OPC节点百科</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23111110'/><circle cx='16' cy='16' r='12' stroke='%23C0392B' stroke-width='1.5' fill='none'/><circle cx='16' cy='16' r='5' fill='%23C0392B'/></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --bg: #111110;
      --surface: #1A1A18;
      --text-primary: #F0EDE6;
      --text-secondary: #7A7670;
      --accent: #C0392B;
      --line: #2A2A28;
    }
    body { background: var(--bg); color: var(--text-primary); font-family: 'Noto Sans SC', sans-serif; }
    .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .loading-bar { width: 100%; height: 1px; background: var(--line); position: relative; overflow: hidden; max-width: 200px; }
    .loading-bar::after { content: ''; position: absolute; left: -50%; top: 0; width: 50%; height: 100%; background: var(--accent); animation: loading-slide 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; }
    @keyframes loading-slide { from { left: -50%; } to { left: 100%; } }
  </style>
</head>
<body>
  <div id="app" data-slug="${node.slug}">
    <div class="loading">
      <div class="loading-bar"></div>
    </div>
  </div>
  <script type="module">
    const SLUG = "${node.slug}";

    async function loadNode() {
      try {
        const res = await fetch(\`/api/nodes/\${SLUG}\`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        renderNode(data);
      } catch (e) {
        document.getElementById('app').innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-secondary)">加载失败</div>';
      }
    }

    function renderNode(node) {
      document.getElementById('app').innerHTML = \`
        <div style="max-width:800px;margin:0 auto;padding:2rem 1.25rem;">
          <a href="/" style="color:var(--text-secondary);font-size:0.75rem;letter-spacing:0.1em;text-decoration:none;">← 返回首页</a>
          <div style="margin-top:2rem;">
            <div style="color:var(--accent);font-size:0.625rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:0.5rem;">\${node.category} · \${node.difficulty}</div>
            <h1 style="font-size:clamp(1.5rem,5vw,2.5rem);font-weight:300;letter-spacing:-0.02em;margin-bottom:1rem;">\${node.title}</h1>
            <p style="color:var(--text-secondary);line-height:1.9;">\${node.summary}</p>
          </div>
          <div style="margin-top:2rem;padding-top:2rem;border-top:1px solid var(--line);">
            <div style="color:var(--text-secondary);font-size:0.875rem;">内容加载中...</div>
          </div>
        </div>
      \`;
    }

    loadNode();
  </script>
</body>
</html>`;

      fs.writeFileSync(path.join(nodeDir, 'index.html'), html);

      successCount++;
      console.log(`  ✅ ${dirName}`);
    } catch (err) {
      errorCount++;
      console.log(`  ❌ ${dirName}: ${err.message}`);
    }
  }

  console.log(`\n✨ 迁移完成！`);
  console.log(`  成功: ${successCount}`);
  console.log(`  失败: ${errorCount}`);

  // 创建 test/ 和 services/ 目录
  console.log('\n📁 创建 test/ 和 services/ 目录...');

  const testDir = path.join(ROOT, 'test');
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(path.join(testDir, 'data.json'), JSON.stringify({ type: 'test' }, null, 2));
  fs.writeFileSync(path.join(testDir, 'index.md'), `# OPC适配测试\n\n## 需求文档\n\n### 基本信息\n- **类型**: 测试子项目\n\n## 当前内容\n\n（AI 生成内容放置于此）\n`);
  fs.writeFileSync(path.join(testDir, 'index.html'), `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>OPC适配测试 - OPC节点百科</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n  <div id="app" data-type="test"></div>\n</body>\n</html>`);
  console.log('  ✅ test/');

  const servicesDir = path.join(ROOT, 'services');
  fs.mkdirSync(servicesDir, { recursive: true });
  fs.writeFileSync(path.join(servicesDir, 'data.json'), JSON.stringify({ type: 'services' }, null, 2));
  fs.writeFileSync(path.join(servicesDir, 'index.md'), `# 服务市场\n\n## 需求文档\n\n### 基本信息\n- **类型**: 服务市场子项目\n\n## 当前内容\n\n（AI 生成内容放置于此）\n`);
  fs.writeFileSync(path.join(servicesDir, 'index.html'), `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>服务市场 - OPC节点百科</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n  <div id="app" data-type="services"></div>\n</body>\n</html>`);
  console.log('  ✅ services/');

  console.log('\n🎉 全部完成！');
}

migrate().catch(console.error);
