// 用户认证模块 - 用户名+密码登录
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============ 数据存储 ============
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const PURCHASES_FILE = path.join(DATA_DIR, 'purchases.json');

function readUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')); }
  catch { return []; }
}

function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readSubscriptions() {
  ensureDataDir();
  if (!fs.existsSync(SUBS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8')); }
  catch { return []; }
}

function writeSubscriptions(subs) {
  ensureDataDir();
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

function readPurchases() {
  ensureDataDir();
  if (!fs.existsSync(PURCHASES_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(PURCHASES_FILE, 'utf-8')); }
  catch { return []; }
}

function writePurchases(purchases) {
  ensureDataDir();
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2));
}

// ============ JWT Token ============
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'opcone-secret-key-change-in-production';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username || user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

// ============ 密码加密 ============
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return salt + ':' + hash;
}

function verifyPassword(password, hash) {
  if (!hash || !hash.includes(':')) return false;
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return computedHash === storedHash;
}

// ============ API接口 ============

// 注册
function handleRegister(username, password) {
  if (!username || typeof username !== 'string') {
    return { success: false, error: '请输入用户名' };
  }
  username = username.trim();
  if (username.length < 2 || username.length > 20) {
    return { success: false, error: '用户名需2-20个字符' };
  }
  if (!/^[\w\u4e00-\u9fa5]+$/.test(username)) {
    return { success: false, error: '用户名只能包含中文、英文、数字和下划线' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: '密码至少6位' };
  }

  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return { success: false, error: '该用户名已被使用' };
  }

  const user = {
    id: Date.now().toString(),
    username,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  const token = generateToken(user);
  return { success: true, token, user: { id: user.id, username: user.username } };
}

// 登录
function handleLogin(username, password) {
  if (!username || !password) {
    return { success: false, error: '请输入用户名和密码' };
  }

  const users = readUsers();

  // 支持用户名 / 旧email / 旧phone字段登录（向后兼容）
  const user = users.find(u =>
    u.username === username || u.email === username || u.phone === username
  );

  if (!user) {
    return { success: false, error: '用户名或密码错误' };
  }

  if (!user.password_hash) {
    return { success: false, error: '账号未设置密码，请重新注册' };
  }

  if (!verifyPassword(password, user.password_hash)) {
    return { success: false, error: '用户名或密码错误' };
  }

  const token = generateToken(user);
  return { success: true, token, user: { id: user.id, username: user.username || user.phone } };
}

// ============ 鉴权中间件 ============
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer test') {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: '登录已过期，请重新登录' });
  }
  req.user = payload;
  next();
}

// 获取订阅状态
function getSubscriptionStatus(userId) {
  const subs = readSubscriptions();
  const activeSub = subs.find(s => s.user_id === userId && s.status === 'active');

  if (!activeSub) {
    return { subscribed: false, plan: null, expires_at: null };
  }

  if (new Date(activeSub.expires_at) < new Date()) {
    activeSub.status = 'expired';
    writeSubscriptions(subs);
    return { subscribed: false, plan: null, expires_at: activeSub.expires_at };
  }

  return {
    subscribed: true,
    plan: activeSub.plan,
    expires_at: activeSub.expires_at,
    auto_renew: activeSub.auto_renew
  };
}

// 创建订阅
function createSubscription(userId, plan) {
  const subs = readSubscriptions();

  const existing = subs.findIndex(s => s.user_id === userId && s.status === 'active');
  if (existing >= 0) {
    subs[existing].status = 'cancelled';
    subs[existing].auto_renew = false;
  }

  const startsAt = new Date();
  const expiresAt = new Date();
  if (plan === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (plan === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  const newSub = {
    id: Date.now().toString(),
    user_id: userId,
    plan,
    status: 'active',
    starts_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    auto_renew: true,
    created_at: new Date().toISOString()
  };

  subs.push(newSub);
  writeSubscriptions(subs);

  return { success: true, subscription: newSub };
}

// 检查节点访问权限
function canAccessNode(userId, nodeSlug) {
  if (nodeSlug === 'opc-fit-test') {
    return { can_access: true, reason: 'free_node' };
  }

  const status = getSubscriptionStatus(userId);
  if (status.subscribed) {
    return { can_access: true, reason: 'subscribed' };
  }

  const purchases = readPurchases();
  const purchased = purchases.find(p =>
    p.user_id === userId && p.node_slug === nodeSlug && p.status === 'completed'
  );
  if (purchased) {
    return { can_access: true, reason: 'purchased' };
  }

  return { can_access: false, reason: 'subscription_or_purchase_required' };
}

// 记录单节点购买
function addNodePurchase(userId, nodeSlug, paymentInfo = {}) {
  const purchases = readPurchases();
  const existing = purchases.find(p =>
    p.user_id === userId && p.node_slug === nodeSlug && p.status === 'completed'
  );
  if (existing) {
    return { success: false, error: '已购买过该节点' };
  }

  const purchase = {
    id: Date.now().toString(),
    user_id: userId,
    node_slug: nodeSlug,
    status: 'completed',
    purchased_at: new Date().toISOString(),
    payment: paymentInfo
  };
  purchases.push(purchase);
  writePurchases(purchases);
  return { success: true, purchase };
}

// 检查节点内项目访问权限
function canAccessContent(userId, nodeSlug, itemName) {
  const status = getSubscriptionStatus(userId);
  if (status.subscribed) {
    return { can_access: true, reason: 'subscribed' };
  }

  const purchases = readPurchases();
  const purchased = purchases.find(p =>
    p.user_id === userId && p.node_slug === nodeSlug &&
    p.item_name === itemName && p.status === 'completed'
  );
  if (purchased) {
    return { can_access: true, reason: 'purchased' };
  }

  return { can_access: false, reason: 'purchase_required' };
}

module.exports = {
  handleRegister,
  handleLogin,
  verifyToken,
  authMiddleware,
  getSubscriptionStatus,
  createSubscription,
  canAccessNode,
  canAccessContent,
  addNodePurchase,
  generateToken
};
