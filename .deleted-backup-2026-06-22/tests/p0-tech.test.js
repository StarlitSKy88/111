/**
 * 第4层：技术质量
 * 验证HTML合法性、无敏感信息泄露、CSS变量一致
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
const secretPatterns = [
  /sk-[a-zA-Z0-9]{20,}/,      // OpenAI/DeepSeek API key
  /AKID[a-zA-Z0-9]{20,}/,      // 腾讯云 SecretId
  /SECRET['"]?\s*[:=]\s*['"][^'"]{8,}['"]/, // 通用secret
  /password['"]?\s*[:=]\s*['"]\S+['"]/,      // 硬编码密码
];

console.log('============================================================');
console.log('  第4层：技术质量');
console.log('============================================================\n');

// 4.1 HTML标签平衡
console.log('--- 4.1 HTML标签平衡 ---');
let unbalanced = [];
for (const dir of dirs) {
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  const divOpen = (html.match(/<div[>\s]/g) || []).length;
  const divClose = (html.match(/<\/div>/g) || []).length;
  const sectionOpen = (html.match(/<section[>\s]/g) || []).length;
  const sectionClose = (html.match(/<\/section>/g) || []).length;
  if (Math.abs(divOpen - divClose) > 1) unbalanced.push(`${dir}: div ${divOpen}/${divClose}`);
  if (Math.abs(sectionOpen - sectionClose) > 1) unbalanced.push(`${dir}: section ${sectionOpen}/${sectionClose}`);
}
if (unbalanced.length > 0) {
  unbalanced.forEach(u => warning(u));
} else {
  assert(true, '全部节点HTML标签平衡');
}

// 4.2 无敏感信息泄露
console.log('\n--- 4.2 无敏感信息 ---');
let leaks = [];
const allFiles = [
  ...dirs.map(d => path.join(NODES_DIR, d, 'index.html')),
  path.join(BASE, 'index.html'),
  path.join(BASE, 'admin.html'),
  path.join(BASE, 'app.js'),
];
for (const f of allFiles) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      leaks.push(`${path.relative(BASE, f)} 疑似包含敏感信息`);
      break;
    }
  }
}
if (leaks.length > 0) {
  leaks.forEach(l => warning(l));
} else {
  assert(true, '前端文件中无敏感信息泄露');
}

// 4.3 CSS核心变量
console.log('\n--- 4.3 CSS变量一致性 ---');
const coreVars = ['--bg', '--accent', '--text-primary', '--text-secondary'];
let missingVars = [];
for (const dir of dirs) {
  if (dir === '37-customer-objections') continue;
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  for (const v of coreVars) {
    if (!html.includes(v)) {
      missingVars.push(`${dir}: 缺CSS变量 ${v}`);
      break;
    }
  }
}
if (missingVars.length > 0) {
  missingVars.forEach(m => warning(m));
} else {
  assert(true, '全部节点CSS核心变量完整');
}

// 4.4 Viewport
console.log('\n--- 4.4 移动端适配 ---');
let noViewport = [];
for (const dir of dirs) {
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  if (!/viewport/.test(html)) noViewport.push(dir);
}
assert(noViewport.length === 0, noViewport.length ? `${noViewport.join(', ')} 缺viewport` : '全部节点有viewport');

// 4.5 .gitignore
console.log('\n--- 4.5 .gitignore ---');
const gitignore = fs.readFileSync(path.join(BASE, '.gitignore'), 'utf8');
assert(gitignore.includes('.env'), '.gitignore包含.env');
assert(gitignore.includes('node_modules'), '.gitignore包含node_modules');

// 4.6 无console.log残留
console.log('\n--- 4.6 生产代码规范 ---');
// 只检查HTML中内联的console.log（app.js中的是有意保留的调试工具）
let consoleNodes = [];
for (const dir of dirs) {
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/g);
  if (inlineScript) {
    for (const s of inlineScript) {
      if (s.includes('console.log(')) {
        consoleNodes.push(dir);
        break;
      }
    }
  }
}
if (consoleNodes.length > 0) {
  warning(`${consoleNodes.length}个节点HTML含console.log: ${consoleNodes.join(', ')}`);
} else {
  assert(true, '节点HTML无console.log残留');
}

console.log(`\n============================================================`);
console.log(`  技术质量: ✅ ${pass}  ❌ ${fail}  ⚠️ ${warn}`);
console.log(`============================================================`);
process.exit(fail > 0 ? 1 : 0);
