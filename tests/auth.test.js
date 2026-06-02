/**
 * Auth 模块单元测试 — api/auth/index.js
 *
 * 测试：注册、登录、Token、权限、验证码、订阅、角色体系
 *
 * 每个测试前会清空数据文件（beforeEach）并调用 jest.resetModules()
 * 保证每次加载的 auth 模块都是全新的，seedAdmin() 重新执行。
 */
'use strict';

process.env.JWT_SECRET = 'test-secret-key';

const realFs = require('fs');
const path = require('path');
const os = require('os');

const AUTH_PATH = path.join(__dirname, '..', 'api', 'auth', 'index.js');
const AUTH_DATA_BAK = path.join(__dirname, '..', 'data.bak-auth');
const DATA_DIR = path.join(__dirname, '..', 'data');

/** 备份真实 data/ 并用临时目录替换，保证不影响生产数据 */
function setupTempDataDir() {
  const tmp = realFs.mkdtempSync(path.join(os.tmpdir(), 'opc-test-auth-'));
  if (realFs.existsSync(AUTH_DATA_BAK)) realFs.rmSync(AUTH_DATA_BAK, { recursive: true, force: true });
  if (realFs.existsSync(DATA_DIR)) realFs.renameSync(DATA_DIR, AUTH_DATA_BAK);
  realFs.renameSync(tmp, DATA_DIR);
}

function restoreDataDir() {
  if (realFs.existsSync(AUTH_DATA_BAK)) {
    if (realFs.existsSync(DATA_DIR)) realFs.rmSync(DATA_DIR, { recursive: true, force: true });
    realFs.renameSync(AUTH_DATA_BAK, DATA_DIR);
  }
}

/** 清空 data/ 下所有 JSON 数据文件 */
function clearDataFiles() {
  const files = ['users.json', 'subscriptions.json', 'purchases.json',
    'verify-codes.json', 'results.json', 'payments.json', 'pricing.json'];
  files.forEach(f => {
    const fp = path.join(DATA_DIR, f);
    try { realFs.unlinkSync(fp); } catch { /* ok */ }
  });
}

beforeAll(() => { setupTempDataDir(); });
afterAll(() => { restoreDataDir(); });

beforeEach(() => {
  clearDataFiles();
  jest.resetModules();
});

function load() {
  return require(AUTH_PATH);
}

// ────────────────────────────────────
// handleRegister
// ────────────────────────────────────
describe('handleRegister', () => {
  test('registers a new user', () => {
    const a = load();
    const r = a.handleRegister('testuser', 'password123');
    expect(r.success).toBe(true);
    expect(r.user).toBeDefined();
    expect(r.user.username).toBe('testuser');
    expect(r.user.role).toBe('free');
    expect(r.token).toBeDefined();
  });

  test('rejects duplicate username', () => {
    const a = load();
    a.handleRegister('dup', 'password123');
    expect(a.handleRegister('dup', 'otherpw').success).toBe(false);
  });

  test('rejects short password', () => {
    expect(load().handleRegister('u1', '12345').success).toBe(false);
  });

  test('rejects empty username', () => {
    expect(load().handleRegister('', 'pw').success).toBe(false);
  });

  test('rejects special chars in username', () => {
    expect(load().handleRegister('a@b!', 'pw').success).toBe(false);
  });

  test('supports Chinese usernames', () => {
    const r = load().handleRegister('测试用户', 'password123');
    expect(r.success).toBe(true);
    expect(r.user.username).toBe('测试用户');
  });
});

// ────────────────────────────────────
// handleLogin
// ────────────────────────────────────
describe('handleLogin', () => {
  test('correct credentials', () => {
    const a = load();
    a.handleRegister('loginuser', 'mypassword');
    expect(a.handleLogin('loginuser', 'mypassword').success).toBe(true);
  });

  test('wrong password', () => {
    const a = load();
    a.handleRegister('loginuser2', 'correctpw');
    expect(a.handleLogin('loginuser2', 'wrongpassword').success).toBe(false);
  });

  test('nonexistent user', () => {
    expect(load().handleLogin('nobody', 'pw').success).toBe(false);
  });

  test('empty credentials', () => {
    expect(load().handleLogin('', '').success).toBe(false);
  });
});

// ────────────────────────────────────
// verifyToken
// ────────────────────────────────────
describe('verifyToken', () => {
  test('valid token', () => {
    const a = load();
    const r = a.handleRegister('tokenuser', 'password123');
    expect(a.verifyToken(r.token).username).toBe('tokenuser');
  });

  test('invalid token returns null', () => {
    expect(load().verifyToken('garbage')).toBeNull();
  });

  test('empty token returns null', () => {
    expect(load().verifyToken('')).toBeNull();
  });
});

// ────────────────────────────────────
// canAccessNode
// ────────────────────────────────────
describe('canAccessNode', () => {
  test('guest can access node 01 (free)', () => {
    expect(load().canAccessNode(null, 1)).toEqual({ can_access: true, reason: 'free_node' });
  });

  test('guest denied for paid node', () => {
    expect(load().canAccessNode(null, 2)).toEqual({ can_access: false, reason: 'login_required' });
  });

  test('free user denied for paid node', () => {
    const a = load();
    const u = a.handleRegister('freeuser', 'password123');
    expect(a.canAccessNode(u.user.id, 2)).toEqual({ can_access: false, reason: 'subscription_required' });
  });

  test('admin can access any node', () => {
    const a = load();
    expect(a.canAccessNode('0', 99)).toEqual({ can_access: true, reason: 'admin' });
  });
});

// ────────────────────────────────────
// requireRole middleware
// ────────────────────────────────────
describe('requireRole middleware', () => {
  function mocks() {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    return { req, res, next };
  }

  test('guest role passes with no token', () => {
    const a = load();
    const { req, res, next } = mocks();
    a.requireRole('guest')(req, res, next);
    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  test('free requires token', () => {
    const a = load();
    const { req, res, next } = mocks();
    a.requireRole('free')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('valid token passes free guard', () => {
    const a = load();
    const r = a.handleRegister('midtest', 'password123');
    const { req, res, next } = mocks();
    req.headers.authorization = 'Bearer ' + r.token;
    a.requireRole('free')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.username).toBe('midtest');
  });

  test('admin token passes admin guard', () => {
    const a = load();
    const t = a.generateToken({ id: '0', username: 'admin', role: 'admin' });
    const { req, res, next } = mocks();
    req.headers.authorization = 'Bearer ' + t;
    a.requireRole('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

// ────────────────────────────────────
// Verification codes
// ────────────────────────────────────
describe('verification codes', () => {
  test('create + verify', () => {
    const a = load();
    const code = a.createVerifyCode('test@example.com');
    expect(code).toMatch(/^\d{6}$/);
    expect(a.verifyCode('test@example.com', code)).toEqual({ success: true });
  });

  test('wrong code rejected', () => {
    const a = load();
    a.createVerifyCode('wrong@example.com');
    expect(a.verifyCode('wrong@example.com', '000000').success).toBe(false);
  });

  test('no code for email rejected', () => {
    expect(load().verifyCode('nonexist@example.com', '123456').success).toBe(false);
  });
});

// ────────────────────────────────────
// Subscriptions
// ────────────────────────────────────
describe('subscriptions', () => {
  test('monthly subscription', () => {
    const a = load();
    const u = a.handleRegister('sub1', 'password123');
    const r = a.createSubscription(u.user.id, 'monthly');
    expect(r.success).toBe(true);
    expect(r.subscription.plan).toBe('monthly');
  });

  test('yearly subscription', () => {
    const a = load();
    const u = a.handleRegister('sub2', 'password123');
    expect(a.createSubscription(u.user.id, 'yearly').subscription.plan).toBe('yearly');
  });

  test('getSubscriptionStatus active', () => {
    const a = load();
    const u = a.handleRegister('sub3', 'password123');
    a.createSubscription(u.user.id, 'monthly');
    const s = a.getSubscriptionStatus(u.user.id);
    expect(s.subscribed).toBe(true);
    expect(s.plan).toBe('monthly');
  });

  test('getSubscriptionStatus no sub', () => {
    const a = load();
    const u = a.handleRegister('sub4', 'password123');
    expect(a.getSubscriptionStatus(u.user.id).subscribed).toBe(false);
  });
});

// ────────────────────────────────────
// Role utilities
// ────────────────────────────────────
describe('roleAtLeast', () => {
  test('role levels correct', () => {
    const a = load();
    expect(a.ROLE_LEVEL).toEqual({ guest: 0, free: 1, paid: 2, admin: 99 });
  });

  test('comparisons', () => {
    const a = load();
    expect(a.roleAtLeast('admin', 'guest')).toBe(true);
    expect(a.roleAtLeast('free', 'paid')).toBe(false);
    expect(a.roleAtLeast('paid', 'free')).toBe(true);
    expect(a.roleAtLeast('guest', 'guest')).toBe(true);
  });
});
