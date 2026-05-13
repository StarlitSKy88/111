/**
 * 第5层：上线就绪
 * 发布前最后一关
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = path.join(__dirname, '..');
let pass = 0, fail = 0, warn = 0;

function assert(cond, msg) {
  if (cond) { console.log(`  ✅ ${msg}`); pass++; }
  else { console.log(`  ❌ ${msg}`); fail++; }
}
function warning(msg) { console.log(`  ⚠️  ${msg}`); warn++; }

console.log('============================================================');
console.log('  第5层：上线就绪检查');
console.log('============================================================\n');

// 5.1 package.json
console.log('--- 5.1 package.json ---');
const pkg = JSON.parse(fs.readFileSync(path.join(BASE, 'package.json'), 'utf8'));
assert(pkg.name && pkg.name.length > 0, `name: ${pkg.name}`);
assert(pkg.version && pkg.version.length > 0, `version: ${pkg.version}`);
assert(pkg.description && pkg.description.length > 0, `description: ${pkg.description}`);
assert(pkg.scripts && pkg.scripts.start, 'start script 存在');

// 5.2 VERSION一致性
console.log('\n--- 5.2 版本一致性 ---');
const version = fs.readFileSync(path.join(BASE, 'VERSION'), 'utf8').trim();
assert(version === pkg.version, `VERSION(${version}) = package.json(${pkg.version})`);

// 5.3 deploy.sh 可用
console.log('\n--- 5.3 部署脚本 ---');
const deploySh = path.join(BASE, 'deploy.sh');
assert(fs.existsSync(deploySh), 'deploy.sh 存在');
try {
  fs.accessSync(deploySh, fs.constants.X_OK);
  assert(true, 'deploy.sh 可执行');
} catch(e) { warning('deploy.sh 不可执行（chmod +x deploy.sh）'); }

// 5.4 Git状态
console.log('\n--- 5.4 Git工作区 ---');
try {
  const status = execSync('git status --short', { cwd: BASE, encoding: 'utf8' }).trim();
  const lines = status.split('\n').filter(l => l.trim());
  // 排除已知的测试文件和配置文件
  const testFiles = lines.filter(l => l.includes('tests/p0-'));
  const otherFiles = lines.filter(l => !l.includes('tests/p0-'));
  console.log(`  总修改: ${lines.length} 个文件`);
  console.log(`  其中测试文件: ${testFiles.length} 个`);
  console.log(`  其他文件: ${otherFiles.length} 个`);
  if (otherFiles.length > 10) {
    warning(`未提交修改较多 (${otherFiles.length}个): 建议提交`);
  } else {
    assert(true, `未提交修改在可接受范围 (${otherFiles.length}个)`);
  }
} catch(e) { warning(`git status 失败: ${e.message}`); }

// 5.5 首页SEO基础
console.log('\n--- 5.5 SEO基础 ---');
const indexHtml = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
assert(/<title>/.test(indexHtml), '首页有<title>');
assert(/<meta\s+name="description"/.test(indexHtml), '首页有<meta description>');
assert(/lang="zh-CN"/.test(indexHtml) || /lang="zh"/.test(indexHtml), '首页声明了中文lang');

// 5.6 所有数据文件检查
console.log('\n--- 5.6 数据文件 ---');
const dataFiles = ['nodes.json', 'results.json', 'payments.json', 'pricing.json', 'questions.json'];
for (const df of dataFiles) {
  const fp = df === 'questions.json' ? path.join(BASE, df) : path.join(BASE, 'data', df);
  assert(fs.existsSync(fp), `${df} 存在`);
  try {
    const content = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const keys = Object.keys(content);
    if(df==="results.json"||df==="payments.json"){ if(keys.length===0) console.log(`  ⚠️  ${df} 为空对象（初始状态）`); else assert(true,`${df} 非空`); } else { assert(keys.length > 0, `${df} 非空 (${keys.length}个键)`); }
  } catch(e) { assert(false, `${df} JSON无效: ${e.message}`); }
}

// 5.7 README完整性
console.log('\n--- 5.7 README ---');
const readme = fs.readFileSync(path.join(BASE, 'README.md'), 'utf8');
assert(readme.includes('启动'), 'README包含启动说明');
assert(readme.includes('57'), 'README提及57节点');
assert(readme.includes('npm'), 'README包含npm命令');

console.log(`\n============================================================`);
console.log(`  上线就绪: ✅ ${pass}  ❌ ${fail}  ⚠️ ${warn}`);
console.log(`============================================================`);
process.exit(fail > 0 ? 1 : 0);
