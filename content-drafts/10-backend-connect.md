---
node_id: 10
persona: ranmu
cta_type: wechat
keywords: [分钟, 用户认证, 步骤, 免费额度, 内置]
---

# 节点10：后端连接与数据库

> **面向OPC**：Hello World跑通了，但你的页面是死的——没有数据、没有用户、没有记忆。本节点教你2026年OPC最省事的后端方案：Supabase，30分钟从零到有数据库+API。

---

## 一、2026年OPC为什么选Supabase

### 一句话

Supabase = PostgreSQL数据库 + 自动生成的REST API + 用户认证系统 + 文件存储。开源，免费额度够用到1000个用户。

### 对比：自己搭 vs Supabase

| 要做的事 | 自己搭 | Supabase |
|---|---|---|
| 创建数据库 | 装PostgreSQL + 配用户 + 配权限（半天） | 点"New Project"，30秒 |
| 写API | Express手写CRUD（每张表2小时） | 建表后API自动可用 |
| 用户认证 | 手写JWT+密码加密+邮箱验证（2天） | 内置Auth，支持邮箱/手机/OAuth |
| 文件存储 | 配S3/OSS（半天） | 内置Storage |
| 实时数据 | 配WebSocket服务器（1天） | 内置Realtime（3行代码订阅） |
| 备份 | 自己写脚本+cron（1天） | 自动每日备份 |

**OPC的铁律**：除非你有明确的理由自建后端（比如需要复杂的自定义逻辑），否则一律用Supabase。

---

## 二、30分钟从零到有数据的完整流程

### 步骤1：创建Supabase项目（2分钟）

1. 访问 [supabase.com](https://supabase.com) → Sign in with GitHub
2. New Project → 输入项目名 → 设置数据库密码 → Create
3. 等1-2分钟，项目就绪

### 步骤2：建第一张表（3分钟）

```sql
-- 在Supabase SQL Editor中执行
CREATE TABLE user_analyses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  input_text TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 开启实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE user_analyses;
```

### 步骤3：开启Row Level Security（5分钟）

```sql
-- 用户只能看到自己的数据
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能读自己的分析"
  ON user_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的分析"
  ON user_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 步骤4：前端连接（10分钟）

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const supabase = window.supabase.createClient(
  'https://你的项目ID.supabase.co',
  '你的anon_key'  // Supabase Dashboard → Settings → API
);

// 插入数据
await supabase.from('user_analyses').insert({
  user_id: user.id,
  input_text: '用户输入的内容',
  result: { score: 85, suggestion: '...' }
});

// 读取数据
const { data } = await supabase
  .from('user_analyses')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

// 实时订阅（新数据插入时自动更新页面）
supabase.channel('analyses')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_analyses' },
    (payload) => { console.log('新数据:', payload.new); }
  )
  .subscribe();
</script>
```

### 步骤5：用户认证（10分钟）

```javascript
// 邮箱注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// 邮箱登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser();

// OAuth登录（Google/GitHub，一行配置）
await supabase.auth.signInWithOAuth({ provider: 'google' });
```

---

## 三、2026年Supabase免费额度

| 资源 | 免费额度 | 够用到多少用户 |
|---|---|---|
| 数据库 | 500MB | ~10万条记录 |
| API请求 | 200万次/月 | ~500日活用户 |
| 认证用户 | 5万MAU | 够你用到第一轮融资 |
| 存储 | 1GB | ~5000张图片 |
| 实时订阅 | 200个并发连接 | ~500同时在线 |
| Edge Functions | 50万次调用/月 | 够邮件发送等轻量任务 |

---

## 四、什么时候该离开Supabase

| 场景 | 方案 |
|---|---|
| 需要复杂后端逻辑（如支付回调处理） | Supabase Edge Functions（Deno） |
| 数据库查询太慢 | 加索引；还慢就升级Plan |
| 需要WebSocket之外的实时通信 | 自建Socket.io服务器 |
| 需要对接微信支付等国内服务 | Edge Functions做代理转发 |

---

## 五、检查清单

- [ ] Supabase项目已创建
- [ ] 至少1张业务表已建
- [ ] Row Level Security已开启
- [ ] 前端能正常读写数据
- [ ] 用户认证流程正常（注册+登录+获取用户）
- [ ] anon_key已存入环境变量（不硬编码）

---

## 节点资源链接

- 节点09：Git版本控制
- 节点11：用户认证系统
- 节点12：核心功能1开发
