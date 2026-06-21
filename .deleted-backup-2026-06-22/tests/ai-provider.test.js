/**
 * AI Provider 抽象层单元测试
 * 运行: node tests/ai-provider.test.js
 */

const { createProvider, listProviders, AIProvider, PROVIDER_CONFIGS } = require('../api/utils/ai-provider');

let pass = 0, fail = 0;

function assert(cond, name) {
  if (cond) { console.log(`  ✓ ${name}`); pass++; }
  else { console.log(`  ✗ ${name}`); fail++; }
}

console.log('\n=== AI Provider 抽象层测试 ===\n');

// 1. 工厂可创建默认 provider
console.log('1. createProvider() 默认创建 tokenhub');
const p = createProvider();
assert(p instanceof AIProvider, '返回值是 AIProvider 实例');
assert(p.name === 'tokenhub', '默认名 = tokenhub');
assert(p.baseUrl.includes('tokenhub'), 'baseUrl 正确');
assert(p.defaultModel === 'deepseek-v4-flash', 'defaultModel 正确');

// 2. 工厂支持指定 provider
console.log('\n2. createProvider("minimax") 切换到 MiniMax');
const mm = createProvider('minimax');
assert(mm.name === 'minimax', 'provider 切换成功');
assert(mm.baseUrl.includes('minimaxi.com'), 'MiniMax baseUrl 正确');
assert(mm.defaultModel === 'MiniMax-M3', 'MiniMax defaultModel 正确');

// 3. 工厂拒绝未知 provider
console.log('\n3. createProvider("nope") 抛错');
let threw = false;
try { createProvider('nope'); } catch (e) { threw = e.message.includes('Unknown provider'); }
assert(threw, '抛 "Unknown provider" 错误');

// 4. listProviders 列出所有 provider 及 key 状态
console.log('\n4. listProviders() 列出 3 个 provider');
const list = listProviders();
assert(list.length === 3, '返回 3 个 provider');
assert(list[0].hasKey === false || list[0].hasKey === true, 'hasKey 字段是布尔');
assert(list.some(x => x.name === 'tokenhub'), '包含 tokenhub');
assert(list.some(x => x.name === 'minimax'), '包含 minimax');
assert(list.some(x => x.name === 'openai'), '包含 openai');

// 5. 无 API key 抛错（必须先于空 messages 测试，因为 key 检查在前）
console.log('\n5. chat() 无 key 时抛错（先临时清空 env）');
const savedKey = process.env.API_KEY;
delete process.env.API_KEY;
const noKeyProvider = createProvider('tokenhub');
let threwNoKey = false;
noKeyProvider.chat([{ role: 'user', content: 'hi' }]).catch(e => { threwNoKey = e.message.includes('key not configured'); });
setTimeout(() => assert(threwNoKey, '无 key 抛 "key not configured"'), 50);
process.env.API_KEY = savedKey;

// 6. 空 messages 抛错（必须在 noKey 测试之后清空 env）
console.log('\n6. chat() 拒绝空 messages');
delete process.env.API_KEY;
const noKeyP2 = createProvider('tokenhub');
// 我们要测试的是 messages 校验，但因为 key 检查在前，需要在测试时把校验顺序换成 messages 优先
// 这里改为：先 mock apiKey 让校验走到 messages
noKeyP2.apiKey = 'fake-key-for-validation-test';
let threwEmpty = false;
noKeyP2.chat([]).catch(e => { threwEmpty = e.message.includes('non-empty'); });
setTimeout(() => assert(threwEmpty, '空 messages 抛 "non-empty array" 错误'), 50);
process.env.API_KEY = savedKey;

setTimeout(() => {
  console.log(`\n=== 结果: ${pass} 通过 / ${fail} 失败 ===\n`);
  process.exit(fail > 0 ? 1 : 0);
}, 200);
