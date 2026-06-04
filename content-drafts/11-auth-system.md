---
node_id: 11
persona: neutral
cta_type: wechat
keywords: [认证, 登录, 注册, 密码, JWT]
---

# 节点11：用户认证系统

> **面向OPC**：每个需要"用户登录"的 SaaS 都要有这一关。本节点用**最少的代码**实现注册、登录、密码重置 3 个核心功能。

---

## 一、认证系统的 3 个铁律

1. **永远不要自己存明文密码** — 用 bcrypt
2. **永远不要自己写 token 生成** — 用现成的 JWT 库
3. **永远不要在 URL 里放 token** — 放 Authorization header

**OPC 推荐**：用 Supabase Auth 或 Clerk，3 分钟搞定。**不要自己写**。

---

## 二、方案对比：自己写 vs 用服务

| 维度 | 自己写 JWT | Supabase Auth | Clerk |
|:---|:---|:---|:---|
| 学习时间 | 2-3 天 | 1 小时 | 30 分钟 |
| 安全风险 | 高（自己实现 bug 多）| 低 | 极低 |
| 邮件验证 | 自己接 SMTP | 内置 | 内置 |
| 第三方登录 | 自己接 OAuth | 内置 Google/GitHub | 内置 20+ |
| 成本 | 免费 | 免费 50k MAU | 免费 10k MAU |
| **OPC 推荐** | ❌ 复杂场景才用 | ✅ 推荐 | ✅ 推荐 |

**默认选 Supabase Auth** — 与 Supabase 数据库无缝集成，OPC 80% 场景够用。

---

## 三、Supabase Auth 集成（5 步）

### Step 1：装 SDK

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 2：环境变量

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
```

### Step 3：创建客户端

```typescript
// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Step 4：登录组件

```typescript
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert('登录失败: ' + error.message);
  }

  return (
    <div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" />
      <button onClick={handleLogin}>登录</button>
    </div>
  );
}
```

### Step 5：受保护页面

```typescript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function Dashboard() {
  const supabase = createServerClient(/* ... */);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');
  return <div>欢迎, {session.user.email}</div>;
}
```

---

## 四、3 个常见错误

### 1. 前端校验就够了？

**错**。前端只做体验，后端**必须**校验 token。

### 2. Session 存 localStorage 就行？

**对** 但不安全。建议存 cookie（httpOnly）。

### 3. 忘记邮箱验证？

**错**。OPC 一定要开 Supabase 的 "Confirm email" 选项，否则有恶意注册。

---

## 五、检查清单

- [ ] 用户能注册、收到验证邮件
- [ ] 用户能登录、退出
- [ ] 密码至少 8 位 + 1 个数字
- [ ] 受保护页面没登录会跳转到 /login
- [ ] 退出登录按钮工作正常
- [ ] 没把 API key 推到 GitHub

---

## 节点资源链接

- 节点10：后端CRUD连接测试
- 节点12：核心功能1开发
- 节点17：国内支付接入
