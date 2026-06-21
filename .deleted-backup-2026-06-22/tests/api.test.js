/**
 * API 集成测试 — 使用 supertest 测试 Express API 路由
 *
 * 需要启动测试 Express 实例。由于 api/analyze.js 直接调用 app.listen(),
 * 创建一个测试 app 来挂载路由。
 */
'use strict';

process.env.JWT_SECRET = 'test-api-secret';
process.env.API_KEY = ''; // force mock mode

const realFs = require('fs');
const path = require('path');
const os = require('os');
const express = require('express');
const request = require('supertest');

// ── Swap data dir ──
const API_DATA_BAK = path.join(__dirname, '..', 'data.bak-api');

function swapDataDir() {
  const realDir = path.join(__dirname, '..', 'data');
  const tmpDir = realFs.mkdtempSync(path.join(os.tmpdir(), 'api-test-'));
  // Clean old backup if present
  if (realFs.existsSync(API_DATA_BAK)) realFs.rmSync(API_DATA_BAK, { recursive: true, force: true });
  // Move current data dir if it exists
  if (realFs.existsSync(realDir)) realFs.renameSync(realDir, API_DATA_BAK);
  // Place temp dir
  realFs.renameSync(tmpDir, realDir);
}
function restoreDataDir() {
  const realDir = path.join(__dirname, '..', 'data');
  if (realFs.existsSync(realDir)) realFs.rmSync(realDir, { recursive: true, force: true });
  if (realFs.existsSync(API_DATA_BAK)) realFs.renameSync(API_DATA_BAK, realDir);
}

// ── Create test Express app with routes from analyze.js ──
function createTestApp() {
  // Always get fresh module instances
  jest.resetModules();
  const app = express();
  app.use(express.json());

  // Load auth and data-store modules
  const auth = require(path.join(__dirname, '..', 'api', 'auth', 'index.js'));
  const dataStore = require(path.join(__dirname, '..', 'api', 'data-store.js'));

  // ──────────────── Auth routes ────────────────
  app.post('/api/auth/register', (req, res) => {
    const r = auth.handleRegister(req.body.username, req.body.password);
    res.status(r.success ? 200 : 400).json(r);
  });

  app.post('/api/auth/login', (req, res) => {
    const r = auth.handleLogin(req.body.username, req.body.password);
    res.status(r.success ? 200 : 401).json(r);
  });

  app.get('/api/auth/me', auth.requireRole('guest'), (req, res) => {
    if (!req.user) return res.json({ user: null, role: 'guest' });
    const status = auth.getSubscriptionStatus(req.user.userId);
    res.json({ user: { id: req.user.userId, username: req.user.username, role: req.userRole }, subscription: status });
  });

  // ──────────────── Analyze route ────────────────
  app.post('/api/analyze', (req, res) => {
    const { answers } = req.body;
    if (!answers || Object.keys(answers).length < 10) {
      return res.status(400).json({ error: '请完成所有题目' });
    }
    const VALID_KEYS = ['A', 'B', 'C', 'D'];
    for (const [qId, key] of Object.entries(answers)) {
      if (!VALID_KEYS.includes(key)) return res.status(400).json({ error: `无效答案: ${key}` });
    }
    // Mock-mode: return generated results
    const mockResults = {
      fit_score: 78,
      fit_level: '高度适合',
      summary: 'Mock summary',
      strengths: ['S1', 'S2', 'S3'],
      weaknesses: ['W1', 'W2', 'W3'],
      recommendations: ['R1', 'R2', 'R3'],
    };
    const saved = dataStore.saveResult({ ...mockResults, answers });
    res.json({ id: saved.id, ...mockResults });
  });

  // ──────────────── Health ────────────────
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ──────────────── Admin routes (subset) ────────────────
  app.get('/api/admin/pricing', (req, res) => {
    try {
      res.json({ success: true, pricing: dataStore.getPricing() });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/access/:nodeId', auth.requireRole('guest'), (req, res) => {
    const nodeId = parseInt(req.params.nodeId);
    if (isNaN(nodeId)) return res.status(400).json({ success: false, error: '无效的节点ID' });
    const access = auth.canAccessNode(req.user?.userId, nodeId);
    res.json({ success: true, ...access });
  });

  // ──────────────── Test result routes ────────────────
  app.get('/api/assessment/latest-result', (req, res) => {
    const results = dataStore.getAllResults();
    if (!results || results.length === 0) return res.status(404).json({ success: false, error: '暂无测试结果' });
    res.json({ success: true, data: results[0] });
  });

  app.get('/api/assessment/result/:id', (req, res) => {
    const record = dataStore.getResultById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: '未找到' });
    res.json({ success: true, data: record });
  });

  return app;
}

const dataDirPath = path.join(__dirname, '..', 'data');

beforeAll(() => { swapDataDir(); });
afterAll(() => { restoreDataDir(); });

// Clear data files between test suites so tests don't interfere
function clearDataFiles() {
  const files = ['results.json', 'payments.json', 'pricing.json', 'users.json', 'subscriptions.json'];
  files.forEach(f => {
    const fp = path.join(dataDirPath, f);
    try { realFs.unlinkSync(fp); } catch { /* ignore */ }
  });
}

// ────────────────────────────────────
// Test suites
// ────────────────────────────────────
describe('GET /health', () => {
  test('returns ok status', async () => {
    const app = createTestApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('POST /api/auth/register', () => {
  test('registers a new user', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'apitest', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('apitest');
  });

  test('rejects duplicate', async () => {
    const app = createTestApp();
    await request(app).post('/api/auth/register').send({ username: 'dup', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({ username: 'dup', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  test('login succeeds', async () => {
    const app = createTestApp();
    await request(app).post('/api/auth/register').send({ username: 'logintest', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ username: 'logintest', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('login fails with wrong password', async () => {
    const app = createTestApp();
    await request(app).post('/api/auth/register').send({ username: 'logintest2', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ username: 'logintest2', password: 'wrongpw' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/analyze', () => {
  const fullAnswers = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B' };

  test('accepts valid answers', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/api/analyze')
      .send({ answers: fullAnswers });
    expect(res.status).toBe(200);
    expect(res.body.fit_score).toBeDefined();
    expect(res.body.fit_level).toBeDefined();
    expect(res.body.strengths).toHaveLength(3);
  });

  test('rejects incomplete answers', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/api/analyze')
      .send({ answers: { 1: 'A' } });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('所有题目');
  });

  test('rejects invalid answer key', async () => {
    const app = createTestApp();
    const res = await request(app)
      .post('/api/analyze')
      .send({ answers: { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'X' } });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('无效答案');
  });

  test('rejects empty body', async () => {
    const app = createTestApp();
    const res = await request(app).post('/api/analyze').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/access/:nodeId', () => {
  test('guest can access node 1', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/access/1');
    expect(res.status).toBe(200);
    expect(res.body.can_access).toBe(true);
  });

  test('guest denied for node 2', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/access/2');
    expect(res.status).toBe(200);
    expect(res.body.can_access).toBe(false);
  });

  test('rejects invalid node id', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/access/abc');
    expect(res.status).toBe(400);
  });

  test('paid user can access paid nodes', async () => {
    const app = createTestApp();
    // Register user
    const reg = await request(app).post('/api/auth/register').send({ username: 'paiduser', password: 'password123' });
    const token = reg.body.token;
    const userId = reg.body.user.id;

    // Create subscription directly
    const auth = require(path.join(__dirname, '..', 'api', 'auth', 'index.js'));
    auth.createSubscription(userId, 'monthly');

    const res = await request(app)
      .get('/api/access/2')
      .set('Authorization', 'Bearer ' + token);
    expect(res.status).toBe(200);
    expect(res.body.can_access).toBe(true);
  });
});

describe('GET /api/auth/me', () => {
  test('returns guest for no token', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
    expect(res.body.role).toBe('guest');
  });

  test('returns user info with valid token', async () => {
    const app = createTestApp();
    const reg = await request(app).post('/api/auth/register').send({ username: 'meuser', password: 'password123' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer ' + reg.body.token);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('meuser');
  });
});

describe('GET /api/assessment', () => {
  test('latest-result returns 404 when no results', async () => {
    clearDataFiles(); // ensure clean state
    const app = createTestApp();
    const res = await request(app).get('/api/assessment/latest-result');
    expect(res.status).toBe(404);
  });

  test('latest-result returns result after analysis', async () => {
    const app = createTestApp();
    const fullA = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B' };
    await request(app).post('/api/analyze').send({ answers: fullA });

    const res = await request(app).get('/api/assessment/latest-result');
    expect(res.status).toBe(200);
    expect(res.body.data.fit_score).toBeDefined();
  });

  test('result by id returns correct record', async () => {
    const app = createTestApp();
    const fullA = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B' };
    const analyzeRes = await request(app).post('/api/analyze').send({ answers: fullA });
    const id = analyzeRes.body.id;

    const res = await request(app).get(`/api/assessment/result/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });
});

describe('GET /api/admin/pricing', () => {
  test('returns pricing data', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/admin/pricing');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pricing).toBeDefined();
  });
});
