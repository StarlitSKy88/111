# 节点09：Git版本控制初始化

> **面向OPC**：你把第一个页面做出来了——如果明天电脑崩了、改了一个地方之后整个页面坏了、想把3天前的版本找回来——你需要Git。本章只需要会3条命令，从此再也不怕代码丢失。

---

## 一、用AI理解Git：一句话就够了

### 别学理论，先理解这个

> **Git = 代码的"存档系统"**。就像玩游戏时的存档——打Boss前存一个档，万一翻车了可以读档重来。Git就是让你随时可以回到之前任意一次"存档"的工具。

### 三个和你日常对应的概念

| 游戏概念 | Git概念 | 命令 |
|---|---|---|
| 打Boss前存档 | 创建一次提交(commit) | `git commit -m "改完首页样式"` |
| 上传云端存档 | 推送到远程仓库(push) | `git push` |
| 读档回到3天前 | 回退到历史版本 | `git checkout 版本号`（进阶） |

### GitHub / Gitee 是什么

| 平台 | 是什么 | 国内访问 |
|---|---|---|
| **GitHub** | 全球最大的代码托管平台，2026年月活超1亿 | ⚠️ 不稳定 |
| **Gitee（码云）** | 国内版GitHub，深圳公司运营，服务器国内 | ✅ 流畅 |

**推荐方案**：两个都注册。日常推送用Gitee（速度快），GitHub做镜像备份（国际影响力）。

---

## 二、注册与SSH配置（10分钟）

### 第一步：注册Gitee（如果还没账号）

1. 打开 [gitee.com](https://gitee.com)
2. 点"注册"，用手机号或微信注册
3. 登录后，点右上角头像 → "设置" → "SSH公钥"（先放着，等下用）

### 第二步：注册GitHub（同上）

1. 打开 [github.com](https://github.com)
2. 点"Sign up"，用邮箱注册
3. 登录后，点头像 → "Settings" → "SSH and GPG keys"

### 第三步：生成SSH密钥（关键步骤）

SSH密钥 = 你的电脑和Gitee/GitHub之间的"身份卡"。配好之后，推送代码不需要每次输密码。

在VS Code终端中执行（一路回车，不要设密码）：

```bash
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
```

终端会显示密钥保存位置。默认在：

- Mac：`/Users/你的用户名/.ssh/id_ed25519.pub`
- Windows：`C:\Users\你的用户名\.ssh\id_ed25519.pub`

### 第四步：复制公钥

```bash
# Mac
cat ~/.ssh/id_ed25519.pub

# Windows (PowerShell)
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

输出的内容类似 `ssh-ed25519 AAAAC3... 你的邮箱`。复制全部。

### 第五步：粘贴到Gitee和GitHub

1. Gitee：设置 → SSH公钥 → 粘贴 → 标题写"我的Mac"→ 确定
2. GitHub：Settings → SSH and GPG keys → New SSH key → 粘贴 → 标题写"我的Mac"

### 第六步：验证

```bash
# 测试Gitee
ssh -T git@gitee.com
# 成功会显示：Hi 你的用户名! You've successfully authenticated...

# 测试GitHub
ssh -T git@github.com
# 成功会显示：Hi 你的用户名! You've successfully authenticated...
```

两个都显示成功 → ✅ SSH配置完成。

---

## 三、首次 git init → add → commit → push

### 创建远程仓库

**在Gitee上**：
1. 点右上角 "+" → "新建仓库"
2. 仓库名称：`my-first-app`
3. 可见性：选"私有"（你的产品代码不要公开）
4. **不要勾选**"使用Readme文件初始化仓库"（重要！因为你本地已经有代码了）
5. 点"创建"

创建后，Gitee会显示一个页面告诉你"已有仓库？"。你会看到类似这样的命令提示：

```bash
git remote add origin git@gitee.com:你的用户名/my-first-app.git
git push -u origin main
```

### 在本地项目中执行（VS Code终端）

```bash
# 第1步：初始化Git仓库
git init

# 第2步：创建.gitignore（告诉Git忽略哪些文件）
echo "node_modules/
.env
.DS_Store" > .gitignore

# 第3步：把所有文件加入暂存区
git add .

# 第4步：创建第一次提交
git commit -m "🎉 第一个页面：Hello World"

# 第5步：关联远程仓库（替换为你的仓库地址）
git remote add origin git@gitee.com:你的用户名/my-first-app.git

# 第6步：推送到Gitee
git push -u origin main
```

### 验证

打开Gitee → 进入 `my-first-app` 仓库 → 你应该能看到你的 `index.html` 和 `package.json`。

### 同时推送到GitHub（可选）

```bash
# 添加GitHub作为第二个远程仓库
git remote add github git@github.com:你的用户名/my-first-app.git

# 推送到GitHub
git push -u github main
```

以后每次改完代码：
```bash
git push          # 推送到Gitee
git push github   # 推送到GitHub
```

---

## 四、.gitignore 的正确写法

### 什么是 .gitignore

告诉Git"这些文件/文件夹不要管它们，不要上传"。

### OPC项目标准 .gitignore

```
# 依赖包（太大，通过package.json记录就够了，不需要上传几万个小文件）
node_modules/

# 环境变量（里面有密码、API密钥，绝对不能上传！）
.env
.env.local
.env.*.local

# 系统文件
.DS_Store        # Mac自动生成的文件夹信息
Thumbs.db        # Windows自动生成的缩略图

# 构建输出
dist/
build/
.next/

# IDE配置
.vscode/
.idea/

# 调试文件
*.log
npm-debug.log*
```

### 已经不小心上传了不该上传的东西？

```bash
# 1. 先把文件加入.gitignore（比如你忘了忽略 node_modules）
echo "node_modules/" >> .gitignore

# 2. 从Git跟踪中移除（但不删除本地文件）
git rm -r --cached node_modules/

# 3. 提交这个改动
git add .gitignore
git commit -m "添加.gitignore，移除误上传的node_modules"

# 4. 推送
git push
```

---

## 五、Git日常三件套

### 每次改完代码后的标准操作

```bash
# ① 查看改了哪些文件
git status

# ② 把所有改动加入暂存区
git add .

# ③ 创建提交（用一句话说明你做了什么）
git commit -m "做了什么修改"

# ④ 推送到远程仓库
git push
```

### commit message 怎么写（跟AI学）

不需要写成英文。用中文写清楚你做了什么就行：

| 好的 commit message | 不好的 |
|---|---|
| `首页布局改为居中，按钮颜色改成红色` | `改了一下` |
| `修复登录页面手机端按钮点不到的问题` | `fix bug` |
| `新增搜索结果页，展示卡片列表` | `update` |
| `替换首页配图为高清版本` | `改图片` |

**让AI帮你写 commit message**：

> "帮我总结这次改了哪些文件，写一条中文git commit message"

---

## 六、GitHub/Gitee给OPC的可视化操作

你不需要记住所有Git概念。这两个平台都提供了Web操作界面：

| 操作 | 怎么在网页上做 |
|---|---|
| 看历史版本 | 仓库主页 → 点击 "commits"（提交记录） |
| 看某次改了什么 | 点某条commit → 绿色是新增，红色是删除 |
| 回退到旧版本 | 点某条commit → 点 "Browse files" → 能看到当时的完整代码 |
| 下载旧版本 | Code → Download ZIP |

---

## 七、常见问题

### "git push" 报错 permission denied

SSH密钥没配好。重新走本章第二步（生成SSH → 粘贴到Gitee/GitHub）。

### "fatal: remote origin already exists"

你已经关联过了，不需要再 `git remote add`。直接 `git push` 就行。

### "Updates were rejected because the remote contains work"

远程仓库有本地没有的代码（比如你在网页上改过文件）。

```bash
git pull origin main --rebase
git push
```

### 改错了一个文件想撤销

```bash
# 撤销某个文件的修改（回到上次commit的状态）
git checkout -- 文件名

# 撤销所有修改（危险！谨慎使用）
git checkout -- .
```

### 想回到之前的某次提交看看

```bash
# 查看提交历史
git log --oneline

# 回到某次提交（只读，不修改）
git checkout 提交ID的前6位

# 回到最新提交
git checkout main
```

---

## 总纲

> Git是OPC的"后悔药"和"时光机"。你永远可以回到过去任一时刻的代码状态——这个安全感比你想象的更重要。

**日常四步**：
```bash
git status          # 看看改了啥
git add .           # 全部暂存
git commit -m "..." # 创建存档
git push            # 上传云端
```

从今天开始：**每改完一个功能就commit一次，每次结束工作就push一次。**

---

*最后修订：2026年5月9日*
