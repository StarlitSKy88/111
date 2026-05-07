// 用户认证模块
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 用户数据文件路径
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const PURCHASES_FILE = path.join(DATA_DIR, 'purchases.json');

// ========== 购买记录读写 ==========
function readPurchases() {
  ensureDataDir();
  if (!fs.existsSync(PURCHASES_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(PURCHASES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writePurchases(purchases) {
  ensureDataDir();
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2));
}

// 读取用户数据
function readUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

// 写入用户数据
function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 读取订阅数据
function readSubscriptions() {
  ensureDataDir();
  if (!fs.existsSync(SUBS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

// 写入订阅数据
function writeSubscriptions(subs) {
  ensureDataDir();
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

// 生成 JWT token (简化版，实际生产应使用 jsonwebtoken)
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 验证 token
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// 密码加密 (简化版，实际生产应使用 bcrypt)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return salt + ':' + hash;
}

// 验证密码
function verifyPassword(password, hash) {
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return computedHash === storedHash;
}

// 注册
function register(email, password) {
  const users = readUsers();

  // 检查邮箱是否已存在
  if (users.find(u => u.email === email)) {
    return { success: false, error: '邮箱已被注册' };
  }

  // 创建新用户
  const user = {
    id: Date.now().toString(),
    email,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  return { success: true, user: { id: user.id, email: user.email } };
}

// 登录
function login(email, password) {
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { success: false, error: '邮箱或密码错误' };
  }

  const token = generateToken(user);
  return {
    success: true,
    token,
    user: { id: user.id, email: user.email }
  };
}

// 获取用户订阅状态
function getSubscriptionStatus(userId) {
  const subs = readSubscriptions();
  const activeSub = subs.find(s => s.user_id === userId && s.status === 'active');

  if (!activeSub) {
    return { subscribed: false, plan: null, expires_at: null };
  }

  // 检查是否过期
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

  // 取消现有订阅
  const existing = subs.findIndex(s => s.user_id === userId && s.status === 'active');
  if (existing >= 0) {
    subs[existing].status = 'cancelled';
    subs[existing].auto_renew = false;
  }

  // 计算过期时间
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
  // node 01 (opc-fit-test) 对已登录用户免费
  if (nodeSlug === 'opc-fit-test') {
    return { can_access: true, reason: 'free_node' };
  }

  // 检查订阅状态（订阅用户可访问所有节点）
  const status = getSubscriptionStatus(userId);
  if (status.subscribed) {
    return { can_access: true, reason: 'subscribed' };
  }

  // 检查是否已购买该节点（单节点付费）
  const purchases = readPurchases();
  const purchased = purchases.find(p =>
    p.user_id === userId &&
    p.node_slug === nodeSlug &&
    p.status === 'completed'
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
    p.user_id === userId &&
    p.node_slug === nodeSlug &&
    p.status === 'completed'
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
  // 先检查订阅
  const status = getSubscriptionStatus(userId);
  if (status.subscribed) {
    return { can_access: true, reason: 'subscribed' };
  }

  // 检查是否已购买该项目
  const purchases = readPurchases();
  const purchased = purchases.find(p =>
    p.user_id === userId &&
    p.node_slug === nodeSlug &&
    p.item_name === itemName &&
    p.status === 'completed'
  );

  if (purchased) {
    return { can_access: true, reason: 'purchased' };
  }

  return { can_access: false, reason: 'purchase_required' };
}

module.exports = {
  register,
  login,
  verifyToken,
  getSubscriptionStatus,
  createSubscription,
  canAccessNode,
  canAccessContent,
  addNodePurchase,
  generateToken
};