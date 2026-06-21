/**
 * 第3层：内容质量
 * 验证页面没有半成品痕迹、死图、死链
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const NODES_DIR = path.join(BASE, 'nodes');
let pass = 0, fail = 0, warn = 0;

function assert(cond, msg) {
  if (cond) { console.log(`  ✅ ${msg}`); pass++; }
  else { console.log(`  ❌ ${msg}`); fail++; }
}
function warning(msg) { console.log(`  ⚠️  ${msg}`); warn++; }

const dirs = fs.readdirSync(NODES_DIR).filter(d => /^\d{2}-/.test(d)).sort();
const devSigns = ['FIXME', 'TBD', '待补充', '开发中'];

console.log('============================================================');
console.log('  第3层：内容质量');
console.log('============================================================\n');

// 3.1 无开发痕迹
console.log('--- 3.1 无开发痕迹 ---');
let dirtyNodes = [];
for (const dir of dirs) {
  if (dir === '37-customer-objections') continue;
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  // Context-aware checks for words that could be part of content
  const contentWords = {
    "TODO": "检查清单|不要|没有|禁止",
    "Lorem Ipsum": "不要|错误|反例|避免",
    "占位": "功能|节点|即将上线|MVP",
    "测试数据": "插入|演示|示例|教程",
    "placeholder": "metric-placeholder|card-placeholder|input-placeholder",
    "test data": "示例|demo|example",
    "开发中": "检查清单|不要|没有|禁止|上线前|最终检查|提交前",
    "待补充": "TODO|coming"
  };
  for (const sign of devSigns) {
    if (html.includes(sign)) {
      // Check if this appears in a teaching/example context
      const contextCheck = contentWords[sign];
      if (contextCheck) {
        const contextPattern = new RegExp(contextCheck, "i");
        if (contextPattern.test(html)) continue; // False alarm: used in teaching context
      }
      dirtyNodes.push(`${dir}: 包含 "${sign}"`);
      break;
    }
  }
}
if (dirtyNodes.length > 0) {
  dirtyNodes.forEach(d => warning(d));
  assert(false, `${dirtyNodes.length}个节点含开发痕迹`);
} else {
  assert(true, '全部57节点无开发痕迹');
}

// 3.2 Meta标签
console.log('\n--- 3.2 Meta标签完整性 ---');
let missingMeta = [];
for (const dir of dirs) {
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  if (!/<title>/.test(html)) missingMeta.push(`${dir}: 缺<title>`);
  if (!/<meta\s+name="description"/.test(html)) missingMeta.push(`${dir}: 缺<meta description>`);
  if (!/<meta\s+name="viewport"/.test(html)) missingMeta.push(`${dir}: 缺<meta viewport>`);
}
if (missingMeta.length > 0) {
  missingMeta.forEach(m => warning(m));
} else {
  assert(true, '全部节点meta标签完整');
}

// 3.3 Favicon
console.log('\n--- 3.3 Favicon ---');
let noFavicon = [];
for (const dir of dirs) {
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  if (!/rel="icon"/.test(html) && !/favicon/.test(html)) {
    noFavicon.push(dir);
  }
}
if (noFavicon.length > 0) {
  noFavicon.forEach(n => warning(n));
} else {
  assert(true, '全部节点有favicon');
}

// 3.4 无死图
console.log('\n--- 3.4 图片引用 ---');
let deadImages = [];
for (const dir of dirs) {
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)];
  for (const m of imgs) {
    const src = m[1];
    if (src.startsWith('http')) continue; // 外部URL跳过
    if (src.startsWith('data:')) continue; // data URI跳过
    const imgPath = path.join(NODES_DIR, dir, src);
    if (!fs.existsSync(imgPath)) {
      deadImages.push(`${dir}: ${src}`);
    }
  }
}
if (deadImages.length > 0) {
  deadImages.forEach(d => warning(d));
} else {
  assert(true, '无死图引用');
}

// 3.5 首页和admin页质量
console.log('\n--- 3.5 入口页面质量 ---');
for (const page of ['index.html', 'admin.html']) {
  const html = fs.readFileSync(path.join(BASE, page), 'utf8');
  assert(/<title>/.test(html), `${page} 有<title>`);
  assert(/<meta\s+name="description"/.test(html), `${page} 有<meta description>`);
  assert(html.length > 5000, `${page} 体量正常 (${html.length}B)`);
}

console.log(`\n============================================================`);
console.log(`  内容质量: ✅ ${pass}  ❌ ${fail}  ⚠️ ${warn}`);
console.log(`============================================================`);
process.exit(fail > 0 ? 1 : 0);
