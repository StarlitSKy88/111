---
node_id: 7
persona: ranmu
cta_type: wechat
keywords: [环境, 安装, VSCode, Node, 工具]
---

# 节点07：开发环境安装

> **面向OPC**：第一次装环境，最常发生的事是**装到一半放弃**。本节点给你一份**抄作业清单**，按步骤来，1 小时搞定。

---

## 一、必装 4 件套

| 软件 | 版本 | 用途 | 下载 |
|:---|:---|:---|:---|
| **VS Code** | 最新版 | 代码编辑器 | code.visualstudio.com |
| **Node.js** | 20 LTS | 运行 JavaScript | nodejs.org |
| **Git** | 最新版 | 版本控制 | git-scm.com |
| **Google Chrome** | 最新版 | 调试 | google.com/chrome |

**下载顺序**：Node → Git → VS Code → Chrome

---

## 二、Node.js 安装的 3 个坑

### 坑 1：装了 18 又被工具链要 20

**解法**：用 nvm（macOS/Linux）或 nvm-windows（Windows）管理多版本。

```bash
# 安装 nvm（macOS）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 安装 Node 20
nvm install 20
nvm use 20
nvm alias default 20
```

### 坑 2：npm install 慢到怀疑人生

**解法**：换镜像源

```bash
npm config set registry https://registry.npmmirror.com
```

### 坑 3：装全局包没权限

**解法**：macOS 不要用 sudo。用 `npm i -g` 前加 `--prefix=$HOME/.local`，并把 `~/.local/bin` 加到 PATH。

---

## 三、VS Code 必装的 5 个插件

| 插件 | 用途 |
|:---|:---|
| **Chinese (Simplified)** | 中文界面 |
| **ESLint** | 代码错误提示 |
| **Prettier** | 代码格式化 |
| **GitLens** | Git 可视化 |
| **Tailwind CSS IntelliSense** | 写 Tailwind 自动补全 |

**不要装 20 个插件** — 装得多，VS Code 启动慢。

---

## 四、终端配置（macOS / Linux）

### 推荐：iTerm2 + Oh My Zsh

```bash
# 装 Oh My Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

主题选 `agnoster` 或 `robbyrussell`。

### Windows：装 Windows Terminal + WSL 2

WSL 2 让你在 Windows 上跑 Ubuntu，比 Git Bash 强 10 倍。

---

## 五、Git 配置（必做）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git config --global init.defaultBranch main
```

**用和 GitHub 一样的邮箱**，否则贡献图不绿。

---

## 六、检查清单

- [ ] node --version 显示 v20.x
- [ ] npm --version 显示 10.x
- [ ] git --version 显示 2.x
- [ ] VS Code 装了 5 个插件
- [ ] terminal 能用，能写中文
- [ ] Git 全局用户名邮箱配好

---

## 节点资源链接

- 节点06：技术选型（零基础专属）
- 节点08：Hello World 启动
- 节点09：Git版本控制初始化
