// 用户认证模块 - 用户名+密码登录 + 角色体系
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============ 角色体系 ============
const ROLES = {
  GUEST:  'guest',   // 游客 — 未登录，只能看首页
  FREE:   'free',    // 免费用户 — 已注册，基础节点
  PAID:   'paid',    // 付费用户 — 已订阅，全部节点
  ADMIN:  'admin'    // 管理员 — 全部权限 + 管理后台
};

const ROLE_LEVEL = { guest: 0, free: 1, paid: 2, admin: 99 };

function roleAtLeast(userRole, requiredRole) {
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[requiredRole] || 0);
}

// 免费节点白名单（未登录/免费用户可见）
const FREE_NODES = [1];  // 仅节点01：OPC适配测试

// ============ 数据存储 ============
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) { fs.mkdirSync(DATA_DIR, { recursive: true }); }
}

const USERS_FILE      = path.join(DATA_DIR, 'users.json');
const SUBS_FILE       = path.join(DATA_DIR, 'subscriptions.json');
const PURCHASES_FILE  = path.join(DATA_DIR, 'purchases.json');

function readUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')); } catch { return []; }
}
function writeUsers(users) {
  ensureDataDir();
  users.sort((a,b) => a.id - b.id);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readSubscriptions() {
  ensureDataDir();
  if (!fs.existsSync(SUBS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8')); } catch { return []; }
}
function writeSubscriptions(subs) {
  ensureDataDir();
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

function readPurchases() {
  ensureDataDir();
  if (!fs.existsSync(PURCHASES_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(PURCHASES_FILE, 'utf-8')); } catch { return []; }
}
function writePurchases(purchases) {
  ensureDataDir();
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2));
}

// ============ 管理员种子 ============
function seedAdmin() {
  const users = readUsers();
  if (users.find(u => u.role === 'admin')) return;

  const adminUser = {
    id: '0',  // 固定管理员ID
    username: 'admin',
    password_hash: hashPassword('admin123'),
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  users.push(adminUser);
  writeUsers(users);
  console.log('[auth] 管理员账号已创建: admin / admin123');
}
seedAdmin();

// ============ JWT Token ============
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'opcone-secret-key-change-in-production';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username || user.phone, role: user.role || 'free' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
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

// ============ 获取用户角色 ============
function getUserRole(userId) {
  const users = readUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return 'guest';
  // 如果用户有有效订阅，实际角色提升为 paid
  if (user.role !== 'admin') {
    const status = getSubscriptionStatus(userId);
    if (status.subscribed) return 'paid';
  }
  return user.role || 'free';
}

// ============ API接口 ============

// 注册（默认 free 角色）
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
    role: 'free',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  const token = generateToken(user);
  return { success: true, token, user: { id: user.id, username: user.username, role: user.role } };
}

// 登录
function handleLogin(username, password) {
  if (!username || !password) {
    return { success: false, error: '请输入用户名和密码' };
  }

  const users = readUsers();
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

  const role = getUserRole(user.id);
  const token = generateToken(user);
  return {
    success: true,
    token,
    user: { id: user.id, username: user.username || user.phone, role }
  };
}

// ============ 鉴权中间件 ============

// requireRole: 要求最低角色（'guest'表示不要求登录）
function requireRole(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // 游客身份（未登录）
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer test') {
      if (requiredRole === 'guest') {
        req.user = null;
        req.userRole = 'guest';
        return next();
      }
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, error: '登录已过期，请重新登录' });
    }

    // 从数据库获取最新角色（订阅状态可能已变）
    const currentRole = getUserRole(payload.userId);
    if (!roleAtLeast(currentRole, requiredRole)) {
      return res.status(403).json({ success: false, error: '权限不足，需要升级订阅' });
    }

    req.user = payload;
    req.userRole = currentRole;
    next();
  };
}

// 检查是否可以访问指定节点
function canAccessNode(userId, nodeId) {
  // 管理员全通
  const role = getUserRole(userId);
  if (role === 'admin') return { can_access: true, reason: 'admin' };
  // 付费用户全通
  if (role === 'paid') return { can_access: true, reason: 'subscribed' };
  // 免费节点（白名单）
  if (FREE_NODES.includes(nodeId)) return { can_access: true, reason: 'free_node' };
  // 免费用户 / 游客 — 拒绝
  if (!userId) return { can_access: false, reason: 'login_required' };
  return { can_access: false, reason: 'subscription_required' };
}

// ============ 订阅管理 ============

function getSubscriptionStatus(userId) {
  const subs = readSubscriptions();
  const activeSub = subs.find(s => s.user_id === userId && s.status === 'active');
  if (!activeSub) return { subscribed: false, plan: null, expires_at: null };
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

function createSubscription(userId, plan) {
  const subs = readSubscriptions();
  const existing = subs.findIndex(s => s.user_id === userId && s.status === 'active');
  if (existing >= 0) {
    subs[existing].status = 'cancelled';
    subs[existing].auto_renew = false;
  }
  const startsAt = new Date();
  const expiresAt = new Date();
  if (plan === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
  else if (plan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
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

function addNodePurchase(userId, nodeSlug, paymentInfo = {}) {
  const purchases = readPurchases();
  const existing = purchases.find(p =>
    p.user_id === userId && p.node_slug === nodeSlug && p.status === 'completed'
  );
  if (existing) return { success: false, error: '已购买过该节点' };
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

function canAccessContent(userId, nodeSlug, itemName) {
  const status = getSubscriptionStatus(userId);
  if (status.subscribed) return { can_access: true, reason: 'subscribed' };
  const purchases = readPurchases();
  const purchased = purchases.find(p =>
    p.user_id === userId && p.node_slug === nodeSlug &&
    p.item_name === itemName && p.status === 'completed'
  );
  if (purchased) return { can_access: true, reason: 'purchased' };
  return { can_access: false, reason: 'purchase_required' };
}

module.exports = {
  ROLES,
  ROLE_LEVEL,
  roleAtLeast,
  FREE_NODES,
  handleRegister,
  handleLogin,
  verifyToken,
  requireRole,
  canAccessNode,
  getUserRole,
  getSubscriptionStatus,
  createSubscription,
  addNodePurchase,
  canAccessContent,
  generateToken
};
