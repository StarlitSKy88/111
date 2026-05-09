# 节点11：用户认证系统

> **面向OPC**：你的产品现在已经能读写数据了——但所有数据是公开的，任何人都能看到。你需要一道门：让每个用户只能看到自己的数据、改自己的数据。本章用Supabase Auth，5分钟加入邮箱登录。

---

## 一、为什么OPC需要登录

### 三个场景，缺一不可

| 场景 | 没有登录的后果 |
|---|---|
| 用户A提交了一条留言，用户B也提交了一条——但列表里混在一起，分不清谁是谁 | 数据归属混乱 |
| 你的产品按用户收费（比如每人每月¥29） | 无法区分付费用户和未付费用户 |
| 有人恶搞，往你的数据库灌垃圾数据 | 无法封禁 |

### 登录解决的本质问题

> **登录 = 给每个用户发一个唯一的"身份证号"。** 以后这个人每次访问你的产品，你都能认出他来，只给他看他自己的数据。

### Supabase Auth 帮你做的事

| 你自己写的 | Supabase Auth帮你做的 |
|---|---|
| 用户注册页面的登录逻辑 | ✅ 内置 `signUp()` |
| 密码加密存储 | ✅ 自动bcrypt加密 |
| 登录状态保持 | ✅ JWT Token，自动刷新 |
| 找回密码 | ✅ 内置邮件找回 |
| 第三方登录（微信/Google） | ✅ OAuth内置支持 |

---

## 二、Supabase Auth 一键开启（3分钟）

### 第1步：开启邮箱登录

Supabase控制台 → 左侧 "Authentication" → "Providers"：

- 确保 "Email" provider 是 **Enabled** 状态
- 下面 "Confirm email" → **暂时关掉**（开发阶段不要邮箱验证，上线后再开）

### 第2步：获取站点URL和API密钥

Supabase控制台 → "Project Settings" → "API"：

除了之前拿到的 `Project URL` 和 `anon key`，还需要确认：

| 信息 | 值 |
|---|---|
| Project URL | `https://xxxxxxxxxxxx.supabase.co` |
| anon key | 一长串字符 |

### 第3步：把下面这段话发给AI

```
帮我在现有项目中加入Supabase Auth用户认证系统。

Supabase信息：
- Project URL: https://xxxxxxxxxxxx.supabase.co
- anon key: [你的anon key]

要求：

1. 创建注册/登录页面：
   - 页面上方两个标签切换："登录"和"注册"
   - 注册表单：邮箱输入框 + 密码输入框 + 确认密码输入框 + "注册"按钮
   - 登录表单：邮箱输入框 + 密码输入框 + "登录"按钮
   - 邮箱格式校验（包含@和.）
   - 密码至少6位
   - 注册/登录成功后，自动跳转到主页

2. 登录状态检测：
   - 页面加载时检查用户是否已登录
   - 已登录 → 显示用户邮箱 + "退出登录"按钮
   - 未登录 → 显示登录/注册表单

3. 退出登录：
   - 点击"退出登录" → 清除登录状态 → 回到登录页

4. 技术实现：
   - CDN引入 supabase-js SDK
   - onAuthStateChange 监听登录状态变化
   - 所有错误用中文提示（比如"邮箱格式不正确""密码至少6位"）
   - 深色主题（背景#111110，按钮红色#C0392B）

5. 风格要求：
   - 登录页整体居中，卡片式布局
   - 移动端适配
```

### AI会生成的代码结构

```
index.html
├── <div id="auth-container">       ← 登录/注册区域
│   ├── 标签切换（登录/注册）
│   ├── 邮箱输入框
│   ├── 密码输入框
│   ├── 提交按钮
│   └── 错误提示
│
├── <div id="app-container">        ← 登录后才显示的内容
│   ├── 用户邮箱显示
│   ├── 退出登录按钮
│   └── 你的产品核心功能
│
└── <script type="module">
    ├── createClient()              ← 连Supabase
    ├── supabase.auth.getSession()   ← 检查登录状态
    ├── supabase.auth.signUp()      ← 注册
    ├── supabase.auth.signInWithPassword() ← 登录
    ├── supabase.auth.signOut()     ← 退出
    └── onAuthStateChange()         ← 监听状态变化
```

---

## 三、核心代码速查（理解AI写了什么）

### 注册

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: '123456'
})

if (error) {
  // 注册失败：邮箱已被注册、密码太短等
  console.log('注册失败:', error.message)
} else {
  // 注册成功！data.user 包含用户信息
  console.log('注册成功:', data.user.email)
}
```

### 登录

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: '123456'
})

if (error) {
  // 登录失败：邮箱不存在、密码错误等
  console.log('登录失败:', error.message)
} else {
  // 登录成功
  console.log('欢迎回来:', data.user.email)
}
```

### 检查登录状态

```javascript
const { data } = await supabase.auth.getSession()
if (data.session) {
  // 已登录，data.session.user.email 是用户邮箱
  console.log('当前用户:', data.session.user.email)
} else {
  // 未登录，显示登录表单
  console.log('未登录')
}
```

### 退出

```javascript
await supabase.auth.signOut()
// 用户已退出，刷新页面或重定向到登录页
```

### 监听状态变化（自动响应）

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // 用户刚登录或刷新页面时检测到已登录
    showApp()
  } else {
    // 用户刚退出
    showAuthForm()
  }
})
```

---

## 四、Row Level Security（RLS）：真正重要的部分

### 当前的问题

你的 `messages` 表现在是公开的——任何人（甚至不登录）都能读取全部数据、修改任何人的数据。

### 什么是RLS

> **RLS = 行级安全策略。** 你可以设置规则："用户只能读取/修改自己创建的数据。"

### 在Supabase中开启RLS（3步）

**第1步**：Supabase控制台 → Table Editor → 选中 `messages` 表 → 点 "Enable RLS"（如果还没开）。

**第2步**：给 `messages` 表加一个 `user_id` 字段：
- 点 "Add column"
- Name: `user_id`
- Type: `uuid`
- Default: **留空**
- 点 Save

**第3步**：创建RLS策略。点 "Add Policy" → 选择模板：

| 策略名 | 模板 | 说明 |
|---|---|---|
| "用户读自己的消息" | `Enable read access for users based on user_id` | `auth.uid() = user_id` |
| "用户创建消息" | `Enable insert access for authenticated users` | 登录用户都可以插入 |
| "用户改自己的消息" | `Enable update access for users based on user_id` | `auth.uid() = user_id` |
| "用户删自己的消息" | `Enable delete access for users based on user_id` | `auth.uid() = user_id` |

每个策略的 USING 表达式（自动生成）：
```sql
auth.uid() = user_id
```

### 前端也需要改

告诉AI：

```
现在messages表开启了RLS，每条消息需要关联user_id。

请修改代码：
1. 插入消息时，自动带上当前用户的ID：
   supabase.from('messages').insert({
     content: '...',
     user_id: supabase.auth.getUser().data.user.id
   })

2. 读取消息时，只读自己的：
   supabase.from('messages').select().eq('user_id', currentUser.id)
```

---

## 五、微信OAuth登录对接路径

### 适用场景

如果你的产品是微信小程序 / 公众号内网页 / 用户群体在中国大陆，需要微信一键登录。

### 对接路径（概览）

| 步骤 | 操作 |
|---|---|
| **1. 注册微信开放平台** | [open.weixin.qq.com](https://open.weixin.qq.com) → 创建网站应用 → 获取 AppID 和 AppSecret |
| **2. Supabase配置** | Authentication → Providers → 微信（需企业认证，个人暂不支持） |
| **3. 服务器中转** | 微信OAuth需要后端服务器转发token（不能纯前端完成），可以用Supabase Edge Functions |
| **4. 前端调用** | `supabase.auth.signInWithOAuth({ provider: 'wechat' })` |

### 现实提醒

> 截至2026年5月，**个人主体的微信开放平台暂不支持OAuth网页登录**。个人开发者在国内的替代路径：
> - **手机验证码登录**：用Supabase的Phone Auth（需额外配置短信服务商）
> - **邮箱登录**：最简单，本章已覆盖
> - **小程序内登录**：微信小程序自带 `wx.login()`，不需要OAuth

---

## 六、开发 vs 上线：两个模式

### 开发阶段（现在）

```
✅ Confirm email: OFF（注册后直接登录，不需要验证邮箱）
✅ RLS: 开发时可以先不开，功能跑通后再开
✅ 密码要求：最低6位（方便测试）
```

### 上线前必做

```
🔒 Confirm email: ON（注册后发验证邮件）
🔒 RLS: 所有表必须开启
🔒 密码要求：最低8位，包含字母和数字
🔒 登录失败限流：同一IP连续5次失败 → 锁定15分钟
```

---

## 总纲

> 登录系统是你产品的第一道防线，也是数据归属的基础。

**核心操作速查**：

| 操作 | Supabase方法 |
|---|---|
| 注册 | `supabase.auth.signUp({ email, password })` |
| 登录 | `supabase.auth.signInWithPassword({ email, password })` |
| 退出 | `supabase.auth.signOut()` |
| 当前用户 | `supabase.auth.getSession()` |
| 状态监听 | `supabase.auth.onAuthStateChange(...)` |
| 保护数据 | RLS策略：`auth.uid() = user_id` |

---

*最后修订：2026年5月9日*
