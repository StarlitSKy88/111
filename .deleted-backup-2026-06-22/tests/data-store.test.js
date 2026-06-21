/**
 * Data Store 单元测试 — api/data-store.js
 *
 * 测试: saveResult, getResultById, getAllResults,
 *       savePayment, updatePayment, getStats,
 *       getPricing, updatePricing
 */
'use strict';

const realFs = require('fs');
const path = require('path');
const os = require('os');
const DATA_STORE_PATH = path.join(__dirname, '..', 'api', 'data-store.js');

// Swap real data dir with a temp one for isolation
// Uses a unique backup name per test to avoid conflicts with other test files
const DS_DATA_BAK = path.join(__dirname, '..', 'data.bak-ds');

function withTempDataDir(fn) {
  return () => {
    const realDir = path.join(__dirname, '..', 'data');
    const tmpDir = realFs.mkdtempSync(path.join(os.tmpdir(), 'ds-test-'));

    // Backup and swap
    if (realFs.existsSync(DS_DATA_BAK)) realFs.rmSync(DS_DATA_BAK, { recursive: true, force: true });
    if (realFs.existsSync(realDir)) realFs.renameSync(realDir, DS_DATA_BAK);
    realFs.renameSync(tmpDir, realDir);

    try {
      delete require.cache[require.resolve(DATA_STORE_PATH)];
      fn();
    } finally {
      // Restore only if backup exists
      if (realFs.existsSync(realDir)) realFs.rmSync(realDir, { recursive: true, force: true });
      if (realFs.existsSync(DS_DATA_BAK)) realFs.renameSync(DS_DATA_BAK, realDir);
    }
  };
}

describe('saveResult / getResultById / getAllResults', () => {
  test('saves and retrieves a result', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    const saved = ds.saveResult({
      fit_score: 85,
      fit_level: '高度适合',
      summary: 'Test summary',
      strengths: ['S1', 'S2'],
      weaknesses: ['W1'],
      recommendations: ['R1', 'R2', 'R3'],
      answers: { 1: 'A', 2: 'B' }
    });

    expect(saved.id).toBeDefined();
    expect(saved.fit_score).toBe(85);
    expect(saved.fit_level).toBe('高度适合');

    // Get by ID
    const fetched = ds.getResultById(saved.id);
    expect(fetched).not.toBeNull();
    expect(fetched.fit_score).toBe(85);
    expect(fetched.id).toBe(saved.id);
  }));

  test('getAllResults returns all results sorted newest first', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    ds.saveResult({ fit_score: 50, fit_level: '中等', answers: {} });
    ds.saveResult({ fit_score: 90, fit_level: '高度适合', answers: {} });

    const all = ds.getAllResults();
    expect(all.length).toBe(2);
    expect(all[0].fit_score).toBe(90); // newest first
    expect(all[1].fit_score).toBe(50);
  }));

  test('getResultById returns null for unknown id', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    expect(ds.getResultById('nonexistent-id')).toBeNull();
  }));
});

describe('savePayment / updatePayment', () => {
  test('saves payment record', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    const saved = ds.savePayment({
      result_id: 'test-123',
      wechat_id: 'wechat_user',
      paid: false
    });
    expect(saved.id).toBeDefined();
    expect(saved.result_id).toBe('test-123');
    expect(saved.paid).toBe(false);
  }));

  test('updates payment status', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    const result = ds.saveResult({ fit_score: 75, answers: {} });

    ds.updatePayment(result.id, 'wechat_user2');

    const fetched = ds.getResultById(result.id);
    expect(fetched.paid).toBe(true);
    expect(fetched.wechat_id).toBe('wechat_user2');
  }));
});

describe('getStats', () => {
  test('returns zero stats when empty', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    const stats = ds.getStats();
    expect(stats.totalTests).toBe(0);
    expect(stats.paidTests).toBe(0);
    expect(stats.conversionRate).toBe('0');
  }));

  test('calculates stats correctly', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    ds.saveResult({ fit_score: 85, answers: {} });
    ds.saveResult({ fit_score: 45, answers: {} });

    // Add payment for one result
    const all = ds.getAllResults();
    ds.updatePayment(all[0].id, 'wx_user');

    const stats = ds.getStats();
    expect(stats.totalTests).toBe(2);
    expect(stats.paidTests).toBe(1);
    expect(parseFloat(stats.conversionRate)).toBeCloseTo(50, 0);
    expect(stats.scoreDistribution['80-100']).toBe(1);
    expect(stats.scoreDistribution['40-59']).toBe(1);
  }));
});

describe('pricing', () => {
  test('getPricing returns empty object when no file', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    expect(ds.getPricing()).toEqual({});
  }));

  test('updatePricing merges correctly', withTempDataDir(() => {
    const ds = require(DATA_STORE_PATH);
    const updated = ds.updatePricing({ monthly: 9.99, yearly: 99.99 });
    expect(updated.monthly).toBe(9.99);
    expect(updated.yearly).toBe(99.99);

    const fetched = ds.getPricing();
    expect(fetched.monthly).toBe(9.99);
    expect(fetched.yearly).toBe(99.99);
  }));
});
