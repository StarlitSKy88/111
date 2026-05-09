# 节点10：后端CRUD连接测试

> **面向OPC**：你已经有了一个前端页面。现在要让它"变聪明"——用户输入的东西能被保存下来、下一页还能再看到。本章用Supabase（云端数据库），不需要你会SQL，3分钟从零到第一个数据读写。

---

## 一、创建Supabase项目（3分钟）

### 什么是Supabase，一句话

> **Supabase = 给你一个现成的在线数据库 + 自动帮你生成增删改查API。** 你只需要建表，访问数据的代码AI帮你写。

### 注册和创建项目

**第1步**：打开 [supabase.com](https://supabase.com) → 点 "Start your project"

**第2步**：用GitHub账号登录（推荐，之后方便从GitHub直接部署）

**第3步**：点 "New project" → 填写：

| 字段 | 填什么 | 说明 |
|---|---|---|
| Name | `my-first-app` | 项目名，随便起 |
| Database Password | 设置一个密码并**记下来** | 以后要用，建议存到备忘录 |
| Region | **Northeast Asia (Tokyo)** | 离中国大陆最近的节点，延迟最低 |
| Pricing Plan | **Free** | 免费额度足够开发到第一个付费用户 |

**第4步**：点 "Create project" → 等1-2分钟（它要帮你建数据库）

### 创建完成后

你会看到Supabase控制台。左侧菜单是你最常用的三个：

| 菜单 | 干什么 | 你用的频率 |
|---|---|---|
| **Table Editor** | 建表、看数据、手动加数据 | ✅ 每次做新功能 |
| **SQL Editor** | 写SQL（你可能不需要） | ⚠️ 偶尔 |
| **Authentication** | 用户注册登录系统 | 到节点11才用 |

---

## 二、建第一张数据库表（图形化操作，不需要写SQL）

### 概念：表是什么

> **表 = Excel的一个sheet页。**
>
> - 每一行 = 一条数据（比如一个用户、一条留言）
> - 每一列 = 一个字段（比如用户名、创建时间）
> - 主键 = 每条数据的唯一编号（像身份证号）

### 创建你的第一张表

Supabase控制台 → 左侧点 "Table Editor" → 点右上角 "New Table"：

| 设置项 | 填什么 |
|---|---|
| Name | `messages`（表名，全部小写英文字母） |
| Enable Row Level Security (RLS) | **先不勾选**（节点11会讲，现在先做通） |

然后点 "Add column" 加两个字段：

| 字段名(name) | 类型(type) | 默认值(default) | 说明 |
|---|---|---|---|
| `content` | `text` | — | 存入的消息内容 |
| `created_at` | `timestamptz` | `now()` | 自动填入当前时间 |

注意：字段 `id` 是自动生成的，不需要手动加。

点右下角绿色按钮 "Save" → 表创建完成！

### 验证

Table Editor → 选中 `messages` 表 → 点 "Insert row" → 在 `content` 栏随便输入 "测试数据" → 点 "Save"。

你应该能看到一行数据出现在表格中。**这就是你的第一条数据库记录。**

---

## 三、获取API密钥

### 找到你的项目凭据

Supabase控制台 → 左侧最下面 "Project Settings" → "API"：

你会看到两个关键信息：

| 信息 | 在哪 | 干什么 |
|---|---|---|
| **Project URL** | `https://xxxxxxxxxxxx.supabase.co` | 你的数据库的访问地址 |
| **anon public key** | 一长串字符 | 前端的"门禁卡"（公开的，可以放在前端代码里） |

**复制这两个值，存起来。** 后面每做一个新功能都要用到。

---

## 四、用AI写出第一个API调用

### 目标

在 `index.html` 里加一个输入框 + 一个按钮。用户在输入框里打字 → 点按钮 → 数据存到Supabase → 页面下方显示刚才保存的所有消息。

### 把下面这段话发给AI

```
我在做一个Web应用，使用Supabase作为后端。

Supabase信息：
- Project URL: https://xxxxxxxxxxxx.supabase.co
- anon key: [你的anon key]

请修改我的 index.html，增加以下功能：

1. 在按钮下方新增一个区域：
   - 一个文本输入框（placeholder："输入你想说的话..."）
   - 一个提交按钮（文字："保存到数据库"）

2. 点击提交按钮后：
   - 把输入框的内容保存到 Supabase 的 messages 表（字段：content）
   - 保存成功后，刷新下面的消息列表

3. 在提交按钮下方新增一个消息列表区域：
   - 从Supabase读取messages表的所有记录
   - 按 created_at 降序排列（最新的在最上面）
   - 每条消息显示内容和创建时间

4. 页面打开时自动加载消息列表

技术实现：
- 通过CDN引入 supabase-js SDK：https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm
- 使用ES Module方式导入
- 所有逻辑写在 <script type="module"> 标签内
- 保持原有的深色主题风格
```

### AI会解决的事

AI会帮你：
1. 引入Supabase的JS库
2. 创建数据库连接
3. 写"插入数据"的代码（`supabase.from('messages').insert(...)`）
4. 写"读取数据"的代码（`supabase.from('messages').select(...)`)
5. 把数据渲染到页面上

你不需要理解每行代码——但你至少要看懂这两个核心操作。

---

## 五、数据库基础概念速成（30秒版）

### 四个操作合称 CRUD

| 操作 | 英文 | Supabase代码（AI帮你写） | 对应到你的产品 |
|---|---|---|---|
| **增** | Create | `.insert({...})` | 用户提交表单、注册账号、上传内容 |
| **查** | Read | `.select()` | 展示列表、搜索、看详情 |
| **改** | Update | `.update({...}).eq('id', xxx)` | 修改昵称、编辑内容 |
| **删** | Delete | `.delete().eq('id', xxx)` | 删除内容、注销账号 |

**OPC记住这个就够**：所有产品功能，本质上是在做这四个操作的不同组合。

### 数据库 vs 前端

```
用户看到的（前端）          数据存的地方（后端/数据库）
─────────────────────      ─────────────────────────
输入框 + 按钮          →    Supabase messages 表
"保存到数据库"按钮点击   →    .insert({ content: "你好" })
页面加载时的消息列表      ←    .select().order('created_at', {ascending: false})
```

---

## 六、最简 supabase-js 代码示例

以下是一个完整的、可以直接跑的最简示例（AI给你的代码会比这个更完善，但这个版本让你理解核心逻辑）：

```html
<script type="module">
  // ① 引入Supabase
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

  // ② 创建连接
  const supabase = createClient(
    'https://xxxxxxxxxxxx.supabase.co',  // 你的Project URL
    '你的anon key'                          // 你的anon key
  )

  // ③ 读取所有消息
  async function loadMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('读取失败:', error)
      return
    }
    
    // data 是一个数组，每条数据一个对象
    console.log('读取到的消息:', data)
  }

  // ④ 保存一条消息
  async function saveMessage(content) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ content: content })
    
    if (error) {
      console.error('保存失败:', error)
      alert('保存失败！看控制台错误信息')
      return
    }
    
    console.log('保存成功:', data)
    loadMessages() // 刷新列表
  }

  // ⑤ 页面加载时自动读取
  loadMessages()

  // ⑥ 把 saveMessage 绑定到按钮
  document.getElementById('saveBtn').addEventListener('click', () => {
    const text = document.getElementById('inputBox').value
    if (text.trim()) {
      saveMessage(text)
    }
  })
</script>
```

### 关键理解

| 这行代码 | 干了什么 |
|---|---|
| `createClient(url, key)` | 拿着你的"钥匙"连上Supabase |
| `.from('messages')` | 指定操作哪张表 |
| `.select('*')` | 查所有字段 |
| `.insert({ content: '你好' })` | 插入一条数据 |
| `await` | 等操作完成（数据库操作需要时间） |
| `{ data, error }` | 操作结果：要么拿到data（成功），要么拿到error（失败） |

---

## 七、调试：最常见的两个错误

### 错误1：控制台显示 404 / "No rows found"

**原因**：表名拼写错误或表不存在。

**解决**：回到Supabase控制台 → Table Editor → 确认表名是 `messages`（不是 `message`、不是 `Messages`）——表名区分大小写！

### 错误2：控制台显示 401 / "JWT expired" / "No API key"

**原因**：anon key 没写对。

**解决**：检查 `createClient` 的第二个参数，确保是完整的 anon key（带引号）。

---

## 总纲

> 从这一刻起，你的产品有了"记忆"。用户输入的东西不再随着页面刷新而消失——它被存进了一个云端的、永久的数据库中。

**核心能力**：
| 操作 | 你能做什么 |
|---|---|
| `.insert()` | 保存用户输入 → 表单提交、注册、评论 |
| `.select()` | 读取数据 → 列表页、搜索结果、用户主页 |
| `.update()` | 修改数据 → 编辑功能、状态变更 |
| `.delete()` | 删除数据 → 删除功能 |

**你不需要会SQL，不需要搭服务器，不需要配数据库。** 你只需要把建表操作在网页上点几下，然后把 "Supabase Project URL + anon key" 告诉AI——剩下的代码AI帮你写。

---

*最后修订：2026年5月9日*
