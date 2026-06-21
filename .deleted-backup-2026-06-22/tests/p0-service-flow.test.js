const fs = require('fs');
const path = require('path');
const assert = require('assert');

// TDD验证：服务流程 (P0)
console.log('=== TDD验证：服务流程 (P0) ===\n');

try {
  const appPath = path.join(__dirname, '..', 'app.js');
  const content = fs.readFileSync(appPath, 'utf-8');

  // Test 1: state 包含 selectedService
  console.log('Test 1: state 包含 selectedService');
  const stateMatch = content.match(/const state = \{[\s\S]*?selectedService:\s*null/);
  assert(stateMatch, 'state中未找到selectedService: null');
  console.log('  ✅ PASS\n');

  // Test 2: selectService 函数存在
  console.log('Test 2: selectService 函数存在');
  assert(content.includes('function selectService(serviceType)'), '未找到selectService函数');
  assert(content.includes('state.selectedService = serviceType'), 'selectService未设置state.selectedService');
  console.log('  ✅ PASS\n');

  // Test 3: renderServiceIntro 函数存在
  console.log('Test 3: renderServiceIntro 函数存在');
  assert(content.includes('function renderServiceIntro()'), '未找到renderServiceIntro函数');
  assert(content.includes("state.selectedService === 'company-registration'"), 'renderServiceIntro未检查company-registration');
  assert(content.includes("state.selectedService === 'needs-mapping'"), 'renderServiceIntro未检查needs-mapping');
  console.log('  ✅ PASS\n');

  // Test 4: goToPayment 函数存在
  console.log('Test 4: goToPayment 函数存在');
  assert(content.includes('function goToPayment()'), '未找到goToPayment函数');
  assert(content.includes('getServiceConfirmText()'), 'goToPayment未调用getServiceConfirmText');
  console.log('  ✅ PASS\n');

  // Test 5: showPaymentQR 显示正确的服务名称
  console.log('Test 5: showPaymentQR 显示正确的服务名称');
  assert(content.includes('function showPaymentQR()'), '未找到showPaymentQR函数');
  assert(content.includes('serviceName = service === \'company-registration\''), 'showPaymentQR未区分服务类型');
  console.log('  ✅ PASS\n');

  // Test 6: confirmPayment 显示服务-specific的确认信息
  console.log('Test 6: confirmPayment 显示服务-specific的确认信息');
  assert(content.includes('function confirmPayment()'), '未找到confirmPayment函数');
  assert(content.includes('service === \'company-registration\''), 'confirmPayment未区分服务类型');
  assert(content.includes('serviceName'), 'confirmPayment未使用serviceName');
  assert(content.includes('nextSteps'), 'confirmPayment未使用nextSteps');
  console.log('  ✅ PASS\n');

  // Test 7: backToLanding 函数存在
  console.log('Test 7: backToLanding 函数存在');
  assert(content.includes('function backToLanding()'), '未找到backToLanding函数');
  assert(content.includes('state.selectedService = null'), 'backToLanding未重置selectedService');
  assert(content.includes('state.showLanding = true'), 'backToLanding未设置showLanding为true');
  console.log('  ✅ PASS\n');

  // Test 8: restart 函数重置 selectedService
  console.log('Test 8: restart 函数重置 selectedService');
  // 直接搜索字符串，而非正则多行匹配
  const restartIndex = content.indexOf('function restart()');
  assert(restartIndex !== -1, '未找到restart函数');
  const afterRestart = content.substring(restartIndex, restartIndex + 500);
  assert(afterRestart.includes('state.selectedService = null'), 'restart未重置selectedService');
  console.log('  ✅ PASS\n');

  console.log('=== 所有服务流程测试通过 ✅ ===');
} catch (error) {
  console.error('❌ FAIL:', error.message);
  process.exit(1);
}