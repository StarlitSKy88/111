const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..');
const RESULTS_FILE = path.join(DATA_DIR, 'data', 'results.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'data', 'payments.json');
const PRICING_FILE = path.join(DATA_DIR, 'data', 'pricing.json');

// 确保数据目录存在
function ensureDataDir() {
  const dataDir = path.join(DATA_DIR, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// 读取结果数据
function readResults() {
  ensureDataDir();
  if (!fs.existsSync(RESULTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(RESULTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// 写入结果数据
function writeResults(results) {
  ensureDataDir();
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

// 读取支付数据
function readPayments() {
  ensureDataDir();
  if (!fs.existsSync(PAYMENTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// 写入支付数据
function writePayments(payments) {
  ensureDataDir();
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
}

// 保存测试结果
function saveResult(data) {
  const results = readResults();
  const record = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    answers: data.answers,
    fit_score: data.fit_score,
    fit_level: data.fit_level,
    summary: data.summary,
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    recommendations: data.recommendations
  };
  results.unshift(record); // 最新在前
  writeResults(results);
  return record;
}

// 保存支付记录
function savePayment(data) {
  const payments = readPayments();
  const record = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    result_id: data.result_id,
    wechat_id: data.wechat_id,
    paid: data.paid || false,
    paid_at: data.paid_at || null
  };
  payments.unshift(record);
  writePayments(payments);
  return record;
}

// 更新支付状态
function updatePayment(result_id, wechat_id) {
  const payments = readPayments();
  const idx = payments.findIndex(p => p.result_id === result_id);
  if (idx >= 0) {
    payments[idx].paid = true;
    payments[idx].paid_at = new Date().toISOString();
    payments[idx].wechat_id = wechat_id;
  } else {
    payments.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      result_id,
      wechat_id,
      paid: true,
      paid_at: new Date().toISOString()
    });
  }
  writePayments(payments);
}

// 获取统计数据
function getStats() {
  const results = readResults();
  const payments = readPayments();

  const totalTests = results.length;
  const paidTests = payments.filter(p => p.paid).length;

  // 最近7天的数据
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentResults = results.filter(r => new Date(r.timestamp).getTime() > sevenDaysAgo);
  const recentPayments = payments.filter(p => new Date(p.timestamp).getTime() > sevenDaysAgo);

  // 分数分布
  const scoreDistribution = {
    '80-100': results.filter(r => r.fit_score >= 80).length,
    '60-79': results.filter(r => r.fit_score >= 60 && r.fit_score < 80).length,
    '40-59': results.filter(r => r.fit_score >= 40 && r.fit_score < 60).length,
    '0-39': results.filter(r => r.fit_score < 40).length
  };

  return {
    totalTests,
    paidTests,
    unpaidTests: totalTests - paidTests,
    conversionRate: totalTests > 0 ? ((paidTests / totalTests) * 100).toFixed(1) : '0',
    recentTests: recentResults.length,
    recentPaid: recentPayments.filter(p => p.paid).length,
    scoreDistribution,
    lastUpdate: new Date().toISOString()
  };
}

// 获取所有结果（供后台使用）
function getAllResults() {
  const results = readResults();
  const payments = readPayments();

  return results.map(r => {
    const payment = payments.find(p => p.result_id === r.id);
    return {
      ...r,
      paid: payment?.paid || false,
      paid_at: payment?.paid_at || null,
      wechat_id: payment?.wechat_id || null
    };
  });
}

// 根据ID获取单个结果
function getResultById(id) {
  const results = readResults();
  const payments = readPayments();
  const result = results.find(r => r.id === id);
  if (!result) return null;

  const payment = payments.find(p => p.result_id === id);
  return {
    ...result,
    paid: payment?.paid || false,
    paid_at: payment?.paid_at || null,
    wechat_id: payment?.wechat_id || null
  };
}

// ========== 定价配置读写 ==========

function readPricing() {
  ensureDataDir();
  if (!fs.existsSync(PRICING_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(PRICING_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function writePricing(pricing) {
  ensureDataDir();
  fs.writeFileSync(PRICING_FILE, JSON.stringify(pricing, null, 2));
}

function getPricing() {
  return readPricing();
}

function updatePricing(newPricing) {
  const current = readPricing();
  const merged = { ...current, ...newPricing };
  writePricing(merged);
  return merged;
}

module.exports = {
  saveResult,
  savePayment,
  updatePayment,
  getStats,
  getAllResults,
  getResultById,
  getPricing,
  updatePricing
};