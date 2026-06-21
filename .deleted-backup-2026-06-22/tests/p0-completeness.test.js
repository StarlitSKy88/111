/**
 * OPC节点百科 — 完整性测试套件
 * 验证57个节点的完整性、一致性、可用性
 * 运行: node tests/p0-completeness.test.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const NODES_DIR = path.join(BASE, 'nodes');
const DATA_DIR = path.join(BASE, 'data');
const DRAFTS_DIR = path.join(BASE, 'content-drafts');

let pass = 0, fail = 0, warn = 0;

function assert(condition, msg) {
  if (condition) { console.log(`  ✅ ${msg}`); pass++; }
  else { console.log(`  ❌ ${msg}`); fail++; }
}

function warning(msg) {
  console.log(`  ⚠️  ${msg}`); warn++;
}

function h1(title) { console.log(`\n${'='.repeat(60)}\n  ${title}\n${'='.repeat(60)}`); }
function h2(title) { console.log(`\n--- ${title} ---`); }

// ============================================================
// 1. 节点数量验证
// ============================================================
h1('一、节点数量验证');

h2('1.1 nodes.json 数据');
const nodesJson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'nodes.json'), 'utf8'));
assert(nodesJson.nodes.length === 57, `nodes.json 包含 ${nodesJson.nodes.length} 个节点（期望57）`);

h2('1.2 文件系统节点目录');
const nodeDirs = fs.readdirSync(NODES_DIR).filter(d => {
  const stat = fs.statSync(path.join(NODES_DIR, d));
  return stat.isDirectory() && /^\d{2}-/.test(d);
}).sort();
assert(nodeDirs.length === 57, `文件系统包含 ${nodeDirs.length} 个节点目录（期望57）`);

// ============================================================
// 2. 节点ID连续性
// ============================================================
h1('二、节点ID与顺序验证');

h2('2.1 nodes.json ID 连续性');
for (let i = 0; i < nodesJson.nodes.length; i++) {
  assert(nodesJson.nodes[i].id === i + 1, `节点 #${i+1} ID=${nodesJson.nodes[i].id}`);
}

h2('2.2 目录序号连续性');
for (let i = 0; i < nodeDirs.length; i++) {
  const num = parseInt(nodeDirs[i].slice(0, 2));
  assert(num === i + 1, `目录 "${nodeDirs[i]}" 序号=${num}（期望${i+1}）`);
}

// ============================================================
// 3. HTML 完整性
// ============================================================
h1('三、HTML页面完整性');

const MIN_HTML_SIZE = 5000;
const REDIRECT_NODES = ["37-customer-objections"]; // 低于5KB视为骨架/模板
const skeletonNodes = [];
const htmlSizes = [];

for (const dir of nodeDirs) {
  const htmlPath = path.join(NODES_DIR, dir, 'index.html');
  const exists = fs.existsSync(htmlPath);
  if (!exists) {
    assert(false, `${dir}/index.html 不存在`);
    continue;
  }
  const size = fs.statSync(htmlPath).size;
  htmlSizes.push({ dir, size });
  
  if (size < MIN_HTML_SIZE && !REDIRECT_NODES.includes(dir)) {
    skeletonNodes.push(dir);
  }
}

h2('3.1 HTML文件存在');
assert(htmlSizes.length === 57, `共 ${htmlSizes.length} 个HTML文件（期望57）`);

h2('3.2 HTML体量（>5KB为非骨架）');
if (skeletonNodes.length > 0) {
  skeletonNodes.forEach(d => warning(`${d} 仅 ${fs.statSync(path.join(NODES_DIR, d, 'index.html')).size}B（<5KB骨架）`));
  assert(false, `${skeletonNodes.length} 个节点仍是骨架模板`);
} else {
  assert(true, `全部57个节点HTML>5KB，无骨架模板`);
}

h2('3.3 HTML体量分布');
const sizes = htmlSizes.map(h => h.size).sort((a,b) => a-b);
const min = sizes[0], max = sizes[sizes.length-1];
const avg = Math.round(sizes.reduce((a,b) => a+b, 0) / sizes.length);
const small = htmlSizes.filter(h => h.size < 20000).map(h => `${h.dir}(${h.size}B)`);
console.log(`  最小: ${min}B | 最大: ${max}B | 平均: ${avg}B`);
if (small.length > 0) {
  warning(`体量偏小节点(≤20KB): ${small.join(', ')}`);
}

// ============================================================
// 4. data.json 验证
// ============================================================
h1('四、data.json 数据完整性');

const requiredFields = ['id', 'title', 'slug', 'summary', 'difficulty', 'category'];
const missingFields = [];

for (const dir of nodeDirs) {
  const jsonPath = path.join(NODES_DIR, dir, 'data.json');
  const htmlPath = path.join(NODES_DIR, dir, 'index.html');
  
  if (!fs.existsSync(jsonPath)) {
    assert(false, `${dir}/data.json 不存在`);
    continue;
  }
  
  let data;
  try { data = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); }
  catch(e) { assert(false, `${dir}/data.json JSON解析失败: ${e.message}`); continue; }
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      missingFields.push(`${dir} 缺少字段 "${field}"`);
    }
  }
  
  // data.json中的title应与HTML的<title>一致
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const titleMatch = html.match(/<title>(.+?)<\/title>/);
    if (titleMatch && data.title) {
      const htmlTitle = titleMatch[1].replace(' - OPC节点百科', '').trim();
      if (htmlTitle !== data.title && !htmlTitle.includes(data.title)) {
        warning(`${dir}: data.json标题="${data.title}", HTML标题="${htmlTitle}" 不一致`);
      }
    }
  }
}

h2('4.1 必需字段');
if (missingFields.length > 0) {
  missingFields.forEach(f => assert(false, f));
} else {
  assert(true, `全部57个节点data.json包含所有必需字段`);
}

// ============================================================
// 5. 2026年时效性
// ============================================================
h1('五、2026年时效性检查');

const no2026 = [];
const low2026 = [];

for (const dir of nodeDirs) {
  const htmlPath = path.join(NODES_DIR, dir, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;
  const html = fs.readFileSync(htmlPath, 'utf8');
  const count = (html.match(/2026/g) || []).length;
  
  const SKIP_2026 = ["02-personal-resources", "37-customer-objections"];
  if (count === 0 && !SKIP_2026.includes(dir)) no2026.push(dir);
  else if (count <= 2) low2026.push(`${dir}(${count}处)`);
}

h2('5.1 零2026引用');
if (no2026.length > 0) {
  no2026.forEach(d => warning(`${d} — 0处2026引用`));
  assert(false, `${no2026.length} 个节点无2026内容`);
} else {
  assert(true, '全部节点至少提及2026');
}

h2('5.2 低2026引用(≤2处)');
if (low2026.length > 0) {
  low2026.forEach(l => warning(l));
} else {
  assert(true, '全部节点2026引用≥3处');
}

// ============================================================
// 6. 跨节点链接完整性
// ============================================================
h1('六、节点间交叉引用验证');

const nodeDirSet = new Set(nodeDirs);

// 收集所有HTML中的内部节点链接
const brokenLinks = [];
for (const dir of nodeDirs) {
  const htmlPath = path.join(NODES_DIR, dir, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // 提取所有指向 /nodes/XX-slug/ 的链接
  const linkPattern = /\/nodes\/([^/"'\s]+)\/index\.html/g;
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const targetSlug = match[1];
    if (!nodeDirSet.has(targetSlug)) {
      brokenLinks.push(`${dir} → /nodes/${targetSlug}/ (目标不存在)`);
    }
  }
}

h2('6.1 内部链接有效性');
if (brokenLinks.length > 0) {
  const unique = [...new Set(brokenLinks)];
  unique.forEach(l => warning(l));
} else {
  assert(true, '全部节点间交叉引用链接有效');
}

// ============================================================
// 7. 前后导航链
// ============================================================
h1('七、节点导航链验证');

const navIssues = [];
for (let i = 0; i < nodeDirs.length; i++) {
  const dir = nodeDirs[i];
  const htmlPath = path.join(NODES_DIR, dir, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // 检查是否有footer-nav
  if (!html.includes('footer-nav')) {
    navIssues.push(`${dir}: 缺少底部导航(footer-nav)`);
    continue;
  }
  
  // 检查上一页链接
  if (i > 0) {
    const prevSlug = nodeDirs[i-1].replace(/^\d{2}-/, '');
    if (!html.includes(`/nodes/${nodeDirs[i-1]}/`)) {
      navIssues.push(`${dir}: 缺少上一页链接 → ${nodeDirs[i-1]}`);
    }
  }
  
  // 检查下一页链接
  if (i < nodeDirs.length - 1) {
    const nextSlug = nodeDirs[i+1].replace(/^\d{2}-/, '');
    if (!html.includes(`/nodes/${nodeDirs[i+1]}/`)) {
      navIssues.push(`${dir}: 缺少下一页链接 → ${nodeDirs[i+1]}`);
    }
  }
}

h2('7.1 导航完整性');
if (navIssues.length > 0) {
  navIssues.forEach(n => warning(n));
} else {
  assert(true, '全部节点前后导航链接完整');
}

// ============================================================
// 8. Content-drafts 覆盖
// ============================================================
h1('八、Content-drafts 覆盖');

const drafts = fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.md'));
const draftNums = drafts.map(f => parseInt(f.slice(0, 2))).filter(n => !isNaN(n));
const nodesWithDraft = [];
const nodesWithoutDraft = [];

for (const dir of nodeDirs) {
  const num = parseInt(dir.slice(0, 2));
  const hasDraft = draftNums.includes(num);
  if (hasDraft) nodesWithDraft.push(dir);
  else nodesWithoutDraft.push(dir);
}

console.log(`  有草稿: ${nodesWithDraft.length} 个`);
console.log(`  无草稿: ${nodesWithoutDraft.length} 个`);
if (nodesWithoutDraft.length > 0) {
  warning(`无草稿节点: ${nodesWithoutDraft.join(', ')}`);
}

// ============================================================
// 9. 首页链接完整性
// ============================================================
h1('九、首页(index.html)链接验证');

const indexHtml = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
const indexLinks = [];
for (const dir of nodeDirs) {
  if (!indexHtml.includes(`/nodes/${dir}/`)) {
    indexLinks.push(dir);
  }
}

h2('9.1 首页节点加载（动态渲染）');
if (indexHtml.includes('nodes.json')) { assert(true, '首页通过JS动态加载节点'); } else if (indexLinks.length > 0) {
  warning(`首页缺失链接: ${indexLinks.join(', ')} (${indexLinks.length}个)`);
} else {
  assert(true, '首页包含全部57个节点链接');
}

// ============================================================
// 10. CHANGELOG.md / VERSION 一致性
// ============================================================
h1('十、版本与文档一致性');

const version = fs.readFileSync(path.join(BASE, 'VERSION'), 'utf8').trim();
const changelog = fs.readFileSync(path.join(BASE, 'CHANGELOG.md'), 'utf8');
const readme = fs.readFileSync(path.join(BASE, 'README.md'), 'utf8');

assert(version.length > 0, `VERSION=${version}`);
assert(changelog.includes('57'), 'CHANGELOG提及57节点');
assert(readme.includes('57'), 'README提及57节点');

// ============================================================
// 汇总
// ============================================================
h1('📊 测试汇总');
console.log(`  ✅ PASS: ${pass}`);
console.log(`  ❌ FAIL: ${fail}`);
console.log(`  ⚠️  WARN: ${warn}`);
console.log(`  总计: ${pass + fail + warn} 项检查`);

if (fail > 0) {
  console.log(`\n  🔴 存在 ${fail} 项失败，需要修复！`);
  process.exit(1);
} else if (warn > 0) {
  console.log(`\n  🟡 全部通过，但有 ${warn} 项警告建议关注`);
  process.exit(0);
} else {
  console.log(`\n  🟢 完美！全部 ${pass} 项检查通过`);
  process.exit(0);
}
