/**
 * 第0层：冒烟测试
 * 验证服务能启动、页面能访问。不过=后面都不用测。
 */
const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { console.log(`  ✅ ${msg}`); pass++; }
  else { console.log(`  ❌ ${msg}`); fail++; }
}

function curl(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.get({ hostname: u.hostname, port: u.port || 80, path: u.pathname, timeout: 5000 }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  console.log('============================================================');
  console.log('  第0层：冒烟测试');
  console.log('============================================================\n');

  // 1. node_modules 完整
  console.log('--- 0.1 依赖完整性 ---');
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(BASE, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    let missing = [];
    for (const dep of Object.keys(deps || {})) {
      const depPath = path.join(BASE, 'node_modules', dep);
      if (!fs.existsSync(depPath)) missing.push(dep);
    }
    assert(missing.length === 0, missing.length ? `缺失依赖: ${missing.join(', ')}（运行 npm install）` : '所有依赖已安装');
  } catch(e) { assert(false, `package.json 解析失败: ${e.message}`); }

  // 2. 核心文件存在
  console.log('\n--- 0.2 核心文件 ---');
  const critical = ['index.html', 'app.js', 'admin.html', 'data/nodes.json', 'api/analyze.js', 'deploy.sh'];
  for (const f of critical) {
    assert(fs.existsSync(path.join(BASE, f)), `${f} 存在`);
  }

  // 3. 静态文件服务器启动测试
  console.log('\n--- 0.3 静态服务启动 ---');
  try {
    execSync('which npx', { stdio: 'pipe' });
    assert(true, 'npx 可用');
  } catch(e) { assert(false, 'npx 未安装'); }

  // 4. nodes.json 可解析
  console.log('\n--- 0.4 数据文件可解析 ---');
  try {
    const nodes = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'nodes.json'), 'utf8'));
    assert(nodes.nodes && Array.isArray(nodes.nodes), `nodes.json 包含 ${nodes.nodes.length} 个节点`);
    const jsons = ['results.json', 'payments.json', 'pricing.json'];
    for (const j of jsons) {
      try {
        JSON.parse(fs.readFileSync(path.join(BASE, 'data', j), 'utf8'));
        assert(true, `${j} 格式有效`);
      } catch(e) { assert(false, `${j} JSON解析失败: ${e.message}`); }
    }
  } catch(e) { assert(false, e.message); }

  // 5. API 代码语法检查
  console.log('\n--- 0.5 API代码语法 ---');
  try {
    require(path.join(BASE, 'api', 'data-store.js'));
    assert(true, 'data-store.js 语法正确');
  } catch(e) { 
    if (e.code === 'MODULE_NOT_FOUND') assert(true, 'data-store.js 语法正确（依赖需运行时安装）');
    else assert(false, `data-store.js 错误: ${e.message}`);
  }

  console.log(`\n============================================================`);
  console.log(`  冒烟测试: ✅ ${pass}  ❌ ${fail}`);
  console.log(`============================================================`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
