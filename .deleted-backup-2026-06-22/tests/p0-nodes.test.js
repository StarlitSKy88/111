const fs = require('fs');
const path = require('path');
const assert = require('assert');

// TDD验证：节点数据 (P0)
console.log('=== TDD验证：节点数据 (P0) ===\n');

try {
  const nodesPath = path.join(__dirname, '..', 'data', 'nodes.json');

  // Test 1: data/nodes.json 文件存在
  console.log('Test 1: data/nodes.json 文件存在');
  assert(fs.existsSync(nodesPath), '文件不存在');
  console.log('  ✅ PASS\n');

  // Test 2: nodes.json 是有效的JSON
  console.log('Test 2: nodes.json 是有效的JSON');
  const content = fs.readFileSync(nodesPath, 'utf-8');
  assert.doesNotThrow(() => JSON.parse(content), 'JSON解析失败');
  console.log('  ✅ PASS\n');

  // Test 3: 包含21个节点
  console.log('Test 3: 包含21个节点');
  const data = JSON.parse(content);
  assert.strictEqual(data.nodes.length, 21, `期望21个节点，实际${data.nodes.length}`);
  console.log('  ✅ PASS\n');

  // Test 4: 每个节点包含必需字段
  console.log('Test 4: 每个节点包含必需字段');
  const requiredFields = ['id', 'title', 'slug', 'summary', 'difficulty', 'category', 'price_standard', 'price_consult', 'ai_summary'];
  data.nodes.forEach((node, index) => {
    requiredFields.forEach(field => {
      assert(node.hasOwnProperty(field), `节点${index + 1}缺少字段: ${field}`);
    });
    assert.strictEqual(typeof node.id, 'number', `节点${index + 1}的id不是数字`);
    assert.strictEqual(typeof node.title, 'string', `节点${index + 1}的title不是字符串`);
    assert(['入门', '进阶', '高级'].includes(node.difficulty), `节点${index + 1}的difficulty不正确`);
    assert(['0-1', '1-10', '10+'].includes(node.category), `节点${index + 1}的category不正确`);
  });
  console.log('  ✅ PASS\n');

  // Test 5: 公司注册节点有正确的price_standard
  console.log('Test 5: 公司注册节点有正确的price_standard (299)');
  const companyNode = data.nodes.find(n => n.slug === 'company-registration');
  assert(companyNode, '找不到company-registration节点');
  assert.strictEqual(companyNode.price_standard, 299, `期望299，实际${companyNode.price_standard}`);
  console.log('  ✅ PASS\n');

  // Test 6: ai_summary字段存在但为null（待生成）
  console.log('Test 6: ai_summary字段存在但为null');
  data.nodes.forEach((node, index) => {
    assert.strictEqual(node.ai_summary, null, `节点${index + 1}的ai_summary不是null`);
  });
  console.log('  ✅ PASS\n');

  console.log('=== 所有节点数据测试通过 ✅ ===');
} catch (error) {
  console.error('❌ FAIL:', error.message);
  process.exit(1);
}