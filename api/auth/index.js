// 用户认证模块 - 手机号+短信验证码
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Redis客户端
let redisClient = null;
let redisConnected = false;

// 初始化Redis连接
async function initRedis() {
  if (redisClient) return redisClient;

  try {
    const redis = require('redis');
    const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = redis.createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => {
      console.error('Redis连接错误:', err.message);
      redisConnected = false;
    });
    redisClient.on('connect', () => {
      console.log('Redis连接成功');
      redisConnected = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error('Redis初始化失败:', err.message);
    redisConnected = false;
    return null;
  }
}

// Redis操作封装
async function redisSet(key, value, expireSeconds = 300) {
  if (!redisConnected) return false;
  try {
    await redisClient.setEx(key, expireSeconds, value);
    return true;
  } catch (err) {
    console.error('Redis写入失败:', err.message);
    return false;
  }
}

async function redisGet(key) {
  if (!redisConnected) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error('Redis读取失败:', err.message);
    return null;
  }
}

async function redisIncr(key) {
  if (!redisConnected) return null;
  try {
    return await redisClient.incr(key);
  } catch (err) {
    console.error('Redis自增失败:', err.message);
    return null;
  }
}

async function redisExpire(key, seconds) {
  if (!redisConnected) return false;
  try {
    await redisClient.expire(key, seconds);
    return true;
  } catch (err) {
    console.error('Redis设置过期失败:', err.message);
    return false;
  }
}

// ============ 腾讯云短信SDK ============
const tencentcloud = require('tencentcloud-sdk-nodejs');
const SmsClient = tencentcloud.sms.v20210111.Client;

// 初始化短信客户端
function getSmsClient() {
  const client = new SmsClient({
    credential: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
    },
    region: 'ap-guangzhou',
    profile: {
      signMethod: 'HmacSHA256',
      endpoint: 'sms.tencentcloudapi.com',
    },
  });
  return client;
}

// 发送短信验证码
async function sendSmsCode(phoneNumber) {
  const client = getSmsClient();

  // 生成6位验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 存储验证码到Redis
  const codeKey = `sms:code:${phoneNumber}`;
  const countKey = `sms:count:${phoneNumber}`;
  const lastKey = `sms:last:${phoneNumber}`;

  // 检查发送频率（60秒内只能发一次）
  const lastSend = await redisGet(lastKey);
  if (lastSend && Date.now() - parseInt(lastSend) < 60000) {
    return { success: false, error: '请稍后再发送验证码' };
  }

  // 检查每日发送次数（每天最多10次）
  const today = new Date().toISOString().split('T')[0];
  const dailyCountKey = `sms:daily:${today}:${phoneNumber}`;
  const dailyCount = await redisIncr(dailyCountKey);
  if (dailyCount === 1) {
    // 第一次，今天过期
    await redisExpire(dailyCountKey, 86400);
  }
  if (dailyCount > 10) {
    return { success: false, error: '今日发送次数已用完，请明天再试' };
  }

  // 存储验证码（5分钟有效期）
  await redisSet(codeKey, code, 300);
  await redisSet(lastKey, Date.now().toString(), 300);

  try {
    // 调用腾讯云发送短信
    const result = await client.SendSms({
      PhoneNumberSet: [`+86${phoneNumber}`],
      SmsSdkAppId: process.env.TENCENT_SMS_APP_ID,
      SignName: process.env.TENCENT_SMS_SIGN,
      TemplateId: process.env.TENCENT_SMS_TEMPLATE_ID,
      TemplateParamSet: [code, '5'],
    });

    if (result.SendStatusSet && result.SendStatusSet[0].Code === 'Ok') {
      return { success: true };
    } else {
      console.error('短信发送失败:', result);
      return { success: false, error: '短信发送失败' };
    }
  } catch (err) {
    console.error('短信发送异常:', err.message);
    return { success: false, error: '短信发送失败，请稍后重试' };
  }
}

// 验证短信验证码
async function verifySmsCode(phoneNumber, code) {
  const codeKey = `sms:code:${phoneNumber}`;
  const storedCode = await redisGet(codeKey);

  if (!storedCode) {
    return { valid: false, error: '验证码已过期，请重新获取' };
  }

  if (storedCode !== code) {
    // 记录错误次数
    const errorKey = `sms:error:${phoneNumber}`;
    const errorCount = await redisIncr(errorKey);
    if (errorCount === 1) {
      await redisExpire(errorKey, 300);
    }

    if (errorCount >= 3) {
      // 3次错误后删除验证码
      await redisClient.del(codeKey);
      await redisClient.del(errorKey);
      return { valid: false, error: '验证码错误次数过多，请重新获取' };
    }

    return { valid: false, error: `验证码错误，剩余${3 - errorCount}次机会` };
  }

  // 验证成功，删除验证码
  await redisClient.del(codeKey);
  const errorKey = `sms:error:${phoneNumber}`;
  await redisClient.del(errorKey);

  return { valid: true };
}

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
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readSubscriptions() {
  ensureDataDir();
  if (!fs.existsSync(SUBS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeSubscriptions(subs) {
  ensureDataDir();
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

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

// ============ JWT Token ============
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'opcone-secret-key-change-in-production';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ============ 密码加密 ============
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return salt + ':' + hash;
}

function verifyPassword(password, hash) {
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return computedHash === storedHash;
}

// ============ API接口 ============

// 发送验证码
async function handleSendCode(phoneNumber) {
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
    return { success: false, error: '手机号格式不正确' };
  }

  return await sendSmsCode(phoneNumber);
}

// 验证验证码并注册
async function handleVerifyAndRegister(phoneNumber, code, password) {
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
    return { success: false, error: '手机号格式不正确' };
  }

  // 验证密码强度
  if (!password || password.length < 6) {
    return { success: false, error: '密码至少6位' };
  }

  // 验证验证码
  const verifyResult = await verifySmsCode(phoneNumber, code);
  if (!verifyResult.valid) {
    return { success: false, error: verifyResult.error };
  }

  const users = readUsers();

  // 检查手机号是否已注册
  if (users.find(u => u.phone === phoneNumber)) {
    return { success: false, error: '该手机号已注册' };
  }

  // 创建新用户
  const user = {
    id: Date.now().toString(),
    phone: phoneNumber,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  const token = generateToken(user);
  return {
    success: true,
    token,
    user: { id: user.id, phone: user.phone }
  };
}

// 验证验证码并登录
async function handleVerifyAndLogin(phoneNumber, code) {
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
    return { success: false, error: '手机号格式不正确' };
  }

  // 验证验证码
  const verifyResult = await verifySmsCode(phoneNumber, code);
  if (!verifyResult.valid) {
    return { success: false, error: verifyResult.error };
  }

  const users = readUsers();
  const user = users.find(u => u.phone === phoneNumber);

  if (!user) {
    return { success: false, error: '该手机号未注册' };
  }

  const token = generateToken(user);
  return {
    success: true,
    token,
    user: { id: user.id, phone: user.phone },
    hasPassword: !!user.password_hash
  };
}

// 密码登录（已有账号）
async function handlePasswordLogin(phoneNumber, password) {
  const users = readUsers();
  const user = users.find(u => u.phone === phoneNumber);

  if (!user) {
    return { success: false, error: '手机号或密码错误' };
  }

  if (!user.password_hash) {
    return { success: false, error: '请先设置密码' };
  }

  if (!verifyPassword(password, user.password_hash)) {
    return { success: false, error: '手机号或密码错误' };
  }

  const token = generateToken(user);
  return {
    success: true,
    token,
    user: { id: user.id, phone: user.phone }
  };
}

// 设置密码（注册后）
async function handleSetPassword(userId, password) {
  if (!password || password.length < 6) {
    return { success: false, error: '密码至少6位' };
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: '用户不存在' };
  }

  users[userIndex].password_hash = hashPassword(password);
  users[userIndex].updated_at = new Date().toISOString();
  writeUsers(users);

  return { success: true };
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
  const status = getSubscriptionStatus(userId);
  if (status.subscribed) {
    return { can_access: true, reason: 'subscribed' };
  }

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

// 初始化Redis
initRedis().catch(console.error);

module.exports = {
  handleSendCode,
  handleVerifyAndRegister,
  handleVerifyAndLogin,
  handlePasswordLogin,
  handleSetPassword,
  verifyToken,
  getSubscriptionStatus,
  createSubscription,
  canAccessNode,
  canAccessContent,
  addNodePurchase,
  generateToken,
  initRedis
};
