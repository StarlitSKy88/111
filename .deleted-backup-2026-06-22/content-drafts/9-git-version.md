---
node_id: 9
persona: ranmu
cta_type: wechat
keywords: [Git, 版本, 控制, 提交, GitHub]
---

# 节点09：Git版本控制初始化

> **面向OPC**：Git 不是程序员的专利，OPC 也要用。它的作用是**让"我 3 周前写的东西怎么没了"这种事不再发生**。

---

## 一、OPC 为什么必须用 Git

| 不用的后果 | 用的好处 |
|:---|:---|
| 改坏代码回不去了 | 任何改动都能回到上一版本 |
| 多个文件改动混在一起 | 每次改动有清晰的提交记录 |
| 电脑坏了文件全没 | 推到 GitHub 就是免费备份 |
| 想看 1 个月前写的啥 | `git log` 一键查看历史 |

**3 个 OPC 必会的命令**：`git add`、`git commit`、`git push`。其他都是锦上添花。

---

## 二、初始化项目的 4 步

### Step 1：项目根目录初始化

```bash
cd my-opc-app
git init
git branch -M main
```

### Step 2：写 .gitignore

Next.js 已经有现成的 `.gitignore`，但 OPC 要再加 3 条：

```gitignore
# 永远不要提交
.env
.env.local
.DS_Store

# 依赖
node_modules/

# 编译产物
.next/
out/
dist/
```

**最重要的 1 条**：`.env` 里通常有 API key，一旦推到 GitHub = 公开发布。

### Step 3：第一次提交

```bash
git add .
git commit -m "feat: initial commit"
```

### Step 4：连 GitHub

```bash
# 在 GitHub 创建空仓库后
git remote add origin https://github.com/你的用户名/my-opc-app.git
git push -u origin main
```

---

## 三、Commit 命名规范（OPC 简化版）

**不要写** "fix" / "update" / "改了一下"。

**用 5 个动词开头**：
- `feat:` 新功能
- `fix:` 修 bug
- `docs:` 改文档
- `style:` 改格式（不影响代码逻辑）
- `chore:` 杂事（升级依赖、删文件）

```
feat: 添加用户登录页面
fix: 修复注册按钮点击没反应
docs: 更新 README 部署说明
chore: 升级 next 到 14.2
```

---

## 四、3 个救命场景

### 场景 1：刚才改坏了，回滚

```bash
# 看最近 5 次提交
git log --oneline -5

# 回滚到指定版本（hash 来自上面）
git reset --hard abc123
```

### 场景 2：临时改点东西又不想提交

```bash
git stash       # 暂存当前修改
git stash pop   # 恢复
```

### 场景 3：在新电脑继续开发

```bash
git clone https://github.com/你的用户名/my-opc-app.git
cd my-opc-app
npm install
```

---

## 五、Git 工具推荐

| 工具 | 用途 |
|:---|:---|
| **GitHub Desktop** | GUI 工具，可视化 diff 和历史 |
| **VS Code GitLens 插件** | 代码里直接看到谁改的、什么时候 |
| **GitHub Mobile App** | 手机上看 PR / issue 通知 |

**不要用命令行以外的方式提交**？错，OPC 不需要酷，用 GUI 工具完全 OK。

---

## 六、检查清单

- [ ] 项目有 .gitignore 包含 .env
- [ ] 代码推到 GitHub
- [ ] commit 命名用 feat/fix/docs/style/chore 前缀
- [ ] 知道 `git log` 和 `git reset --hard` 怎么用
- [ ] 至少有 1 个 backup 在 GitHub（电脑坏了不慌）

---

## 节点资源链接

- 节点08：Hello World 启动
- 节点10：后端CRUD连接测试
- 节点20：Bug集中修复
