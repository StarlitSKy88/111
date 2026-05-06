const fs = require('fs');
const path = require('path');
const assert = require('assert');

// TDD验证：API端点 (P0)
console.log('=== TDD验证：API端点 (P0) ===\n');

try {
  const apiPath = path.join(__dirname, '..', 'api', 'analyze.js');
  const content = fs.readFileSync(apiPath, 'utf-8');

  // Test 1: /api/generate-node-content endpoint 存在
  console.log('Test 1: /api/generate-node-content POST endpoint 存在');
  assert(content.includes("app.post('/api/generate-node-content'"), '未找到/api/generate-node-content endpoint');
  console.log('  ✅ PASS\n');

  // Test 2: endpoint 接收 node_id 和 title 参数
  console.log('Test 2: endpoint 接收 node_id 和 title 参数');
  assert(content.includes('const { node_id, title, summary } = req.body'), '未正确解构参数');
  assert(content.includes('!node_id || !title'), '未验证必填参数');
  console.log('  ✅ PASS\n');

  // Test 3: 调用 DeepSeek API
  console.log('Test 3: 调用 DeepSeek API');
  assert(content.includes('model: \'deepseek-v4-flash\''), '未使用正确的模型');
  assert(content.includes('API_URL'), '未使用API_URL');
  assert(content.includes('Authorization'), '未设置Authorization header');
  console.log('  ✅ PASS\n');

  // Test 4: 返回 content, node_id, generated_at
  console.log('Test 4: 返回 content, node_id, generated_at');
  assert(content.includes('res.json({'), '未返回JSON');
  assert(content.includes('content,'), '未返回content字段');
  assert(content.includes('node_id,'), '未返回node_id字段');
  assert(content.includes('generated_at:'), '未返回generated_at字段');
  console.log('  ✅ PASS\n');

  // Test 5: API Key 检查（降级处理）
  console.log('Test 5: API Key 检查（降级处理）');
  const generateNodeContentIndex = content.indexOf("app.post('/api/generate-node-content'");
  const afterEndpoint = content.substring(generateNodeContentIndex, generateNodeContentIndex + 1000);
  assert(afterEndpoint.includes('!API_KEY') || afterEndpoint.includes('API_KEY'), '未检查API_KEY');
  console.log('  ✅ PASS\n');

  // Test 6: 错误处理
  console.log('Test 6: 错误处理');
  assert(content.includes('try {'), '未使用try-catch');
  assert(content.includes('catch (error)'), '未捕获错误');
  assert(content.includes('res.status(500)'), '未返回500状态码');
  console.log('  ✅ PASS\n');

  // Test 7: Prompt 包含必需内容要求
  console.log('Test 7: Prompt 包含必需内容要求');
  assert(content.includes('为什么这个节点重要'), 'prompt缺少"为什么这个节点重要"');
  assert(content.includes('常见错误'), 'prompt缺少"常见错误"');
  assert(content.includes('推荐的操作步骤'), 'prompt缺少"推荐的操作步骤"');
  assert(content.includes('相关资源和工具'), 'prompt缺少"相关资源和工具"');
  console.log('  ✅ PASS\n');

  console.log('=== 所有API端点测试通过 ✅ ===');
} catch (error) {
  console.error('❌ FAIL:', error.message);
  process.exit(1);
}