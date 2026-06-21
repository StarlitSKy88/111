/**
 * 第2层：功能验证
 * 验证用户4条核心操作路径
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
const nodesJson = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'nodes.json'), 'utf8'));

console.log('============================================================');
console.log('  第2层：功能验证');
console.log('============================================================\n');

// 路径A：节点浏览链
console.log('--- 2.1 节点浏览路径 ---');
let chainOk = true;
for (let i = 0; i < dirs.length; i++) {
  const html = fs.readFileSync(path.join(NODES_DIR, dirs[i], 'index.html'), 'utf8');
  if (i < dirs.length - 1 && dirs[i] !== "37-customer-objections") {
    if (!html.includes(`/nodes/${dirs[i+1]}/`)) {
      warning(`${dirs[i]} 缺少下一页链接 → ${dirs[i+1]}`);
      chainOk = false;
    }
  }
  if (i > 0 && dirs[i] !== '37-customer-objections') {
    if (!html.includes(`/nodes/${dirs[i-1]}/`)) {
      warning(`${dirs[i]} 缺少上一页链接 ← ${dirs[i-1]}`);
      chainOk = false;
    }
  }
}
assert(chainOk, '节点前后导航链完整');

// 路径B：OPC适配测试
console.log('\n--- 2.2 OPC适配测试路径 ---');
const node01 = fs.readFileSync(path.join(NODES_DIR, '01-opc-fit-test', 'index.html'), 'utf8');
const questionsPath = path.join(BASE, 'questions.json');
assert(fs.existsSync(questionsPath), 'questions.json 存在');
try {
  const q = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  assert(q.questions || Array.isArray(q), `questions.json 包含 ${Object.keys(q).length} 个题目`);
} catch(e) { assert(false, `questions.json 解析失败: ${e.message}`); }
assert(node01.includes('question') || node01.includes('题目') || node01.includes('quiz'), '节点01包含答题相关代码');

// 路径C：首页服务入口
console.log('\n--- 2.3 首页服务入口 ---');
const indexHtml = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
assert(indexHtml.includes('app.js') || indexHtml.includes('script'), '首页引用了JS逻辑');
assert(indexHtml.length > 10000, `首页体量正常 (${indexHtml.length}B)`);

// 路径D：管理后台
console.log('\n--- 2.4 管理后台 ---');
const adminHtml = fs.readFileSync(path.join(BASE, 'admin.html'), 'utf8');
assert(adminHtml.length > 5000, `admin.html 体量正常 (${adminHtml.length}B)`);
const adminGuard = path.join(BASE, 'admin-guard.js');
assert(fs.existsSync(adminGuard), 'admin-guard.js 存在');

// 路径E：节点内容完整性
console.log('\n--- 2.5 节点内容可读性 ---');
let emptyNodes = 0;
for (const dir of dirs) {
  if (dir === '37-customer-objections') continue; // 跳转页
  const html = fs.readFileSync(path.join(NODES_DIR, dir, 'index.html'), 'utf8');
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
  if (bodyText.length < 200) {
    warning(`${dir}: 正文内容过少 (${bodyText.length}字)`);
    emptyNodes++;
  }
}
assert(emptyNodes === 0, `全部节点正文>200字 (${emptyNodes}个不达标)`);

console.log(`\n============================================================`);
console.log(`  功能验证: ✅ ${pass}  ❌ ${fail}  ⚠️ ${warn}`);
console.log(`============================================================`);
process.exit(fail > 0 ? 1 : 0);
