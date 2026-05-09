# 节点07：开发环境安装

> **面向OPC**：你不需要装Docker、不需要配Kubernetes、不需要学Linux命令行。本章只装3个东西，30分钟内你的电脑就能开始写代码。Mac和Windows都有，全程截屏级步骤。

---

## 一、OPC最低环境：只需要3个核心工具

### 为什么只装3个

2026年做Web开发的工具链已经极度简化。过去需要配Java环境、配数据库、配Tomcat、配Maven——现在你只需要一个JavaScript运行时、一个编辑器、一个版本管理工具。

| 工具 | 干什么 | 替代了过去哪些东西 |
|---|---|---|
| **Node.js** | 运行JavaScript代码、安装依赖包 | Java JDK + Tomcat + npm |
| **VS Code** | 写代码、装AI插件 | Eclipse + Sublime + 各种IDE |
| **Git** | 版本管理、推送到GitHub/Gitee | SVN、手动备份 |

**就这三个。** 别的都是有了需要再装。

### 不需要装的东西（别浪费时间）

| 不装 | 原因 |
|---|---|
| ❌ Docker | 你不是运维。Supabase代替了本地数据库 |
| ❌ MySQL/PostgreSQL本地 | Supabase在云端，不需要本地装 |
| ❌ Nginx/Apache | Vercel帮你部署，不需要配服务器 |
| ❌ Python（除非你项目用） | Node.js生态足够Web开发 |
| ❌ Webpack/Vite手动配 | AI工具直接帮你配好 |

---

## 二、Node.js 安装（10分钟）

### Mac 安装

**方法一：官网安装包（推荐零基础）**

1. 打开 [nodejs.org](https://nodejs.org)
2. 点击左侧 **LTS** 版本（2026年5月为 v22.x）
3. 下载 `.pkg` 安装包
4. 双击安装，一路点"继续"，不需要改任何设置
5. 安装完成

**验证**：打开"终端"（在启动台搜索 Terminal），输入：

```bash
node -v
```

应该显示 `v22.x.x`

```bash
npm -v
```

应该显示 `10.x.x`

### Windows 安装

1. 打开 [nodejs.org](https://nodejs.org)
2. 下载 Windows Installer (.msi) 64-bit
3. 双击运行，勾选"Automatically install the necessary tools"
4. 一路点 Next，安装完成

**验证**：按 `Win + R`，输入 `cmd`，回车。在命令行中输入：

```bash
node -v
npm -v
```

两个命令都应该显示版本号。

### 设置国内镜像源（必须做）

npm默认从海外服务器下载依赖包，国内速度极慢。安装完Node.js后**立刻执行**：

```bash
npm config set registry https://registry.npmmirror.com
```

验证是否设置成功：

```bash
npm config get registry
```

应显示 `https://registry.npmmirror.com`

**如果以后想恢复默认源**：

```bash
npm config set registry https://registry.npmjs.org
```

### 什么是npm？一句话就够了

**npm = Node Package Manager。** 它是"代码的App Store"——别人写好的功能模块打包好放在上面，你执行 `npm install 包名` 就能下载到你的项目里直接用。

---

## 三、VS Code 安装与配置（10分钟）

### 为什么是VS Code

- 免费 + 中文界面
- 微软维护，更新稳定
- AI插件生态最丰富（GitHub Copilot、Trae插件都直接支持）
- 轻量——打开只需2秒

### 安装

1. 打开 [code.visualstudio.com](https://code.visualstudio.com)
2. 下载对应系统版本（Mac / Windows）
3. Mac：解压后拖到"应用程序"文件夹
4. Windows：双击安装，**勾选"添加到PATH"**

### 必装插件（3个）

打开VS Code → 左侧栏点击"扩展"图标（或按 `Ctrl/⌘ + Shift + X`）→ 搜索以下插件逐个安装：

| 插件 | 干什么 | 必装吗 |
|---|---|---|
| **Chinese (Simplified)** | VS Code界面汉化 | ✅ 英文不好就装 |
| **Prettier** | 代码自动格式化（保存时自动整理代码） | ✅ 必装 |
| **GitHub Copilot** | AI代码补全 | ⚠️ 看你的工具选型（见节点06） |

### 初始化设置（3项）

打开VS Code → 按 `Ctrl/⌘ + ,` → 搜索以下设置：

| 设置项 | 改为 | 原因 |
|---|---|---|
| `Format On Save` | ✅ 勾选 | 每次保存代码自动格式化，不用手动整理 |
| `Auto Save` | `afterDelay` | 自动保存，避免忘记保存就关了 |
| `Tab Size` | `2` | Web开发标准缩进 |

### 首次打开项目

1. VS Code菜单栏 → "文件" → "打开文件夹"
2. 选择一个空文件夹作为你的第一个项目
3. 按 `Ctrl/⌘ + ~` 打开内置终端
4. 以后所有命令行操作都可以在VS Code自带的终端里做，不需要切窗口

---

## 四、Git 安装与首次配置（5分钟）

### Mac 安装

Mac 通常自带 Git。打开终端输入：

```bash
git --version
```

如果没装，系统会提示安装 Xcode Command Line Tools，点"安装"即可。

### Windows 安装

1. 打开 [git-scm.com](https://git-scm.com)
2. 下载 Windows 版本
3. 安装过程中，除了以下两项，其余全部默认：
   - "Default editor" → 选 "Use Visual Studio Code as Git's default editor"
   - "Adjusting the name of the initial branch" → 选 "Override" → 填 `main`

### 首次配置（必须做）

在终端中执行（把名字和邮箱换成你自己的）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

验证：

```bash
git config --global user.name
git config --global user.email
```

这两个信息会出现在你每一次代码提交记录上。使用真实姓名和邮箱——如果你以后接外包、做开源项目，这是你的"署名"。

### OPC的Git就够了

你只需要会3个Git操作（后面节点09会详细讲）：

| 命令 | 作用 |
|---|---|
| `git add .` | 保存所有改动 |
| `git commit -m "说明"` | 创建一条修改记录 |
| `git push` | 上传到GitHub/Gitee |

**现阶段你只需要做到这一步：Git装好了，名字邮箱配好了。** 具体怎么用，节点09有完整教程。

---

## 五、环境可用性检验（2分钟）

装完3个工具后，跑一遍这个检验清单：

```bash
# 1. Node.js 装好了吗？
node -v        # 应显示版本号，如 v22.x.x

# 2. npm 装好了吗？
npm -v         # 应显示版本号

# 3. npm镜像源改了吗？
npm config get registry   # 应显示 npmmirror.com

# 4. Git 装好了吗？
git --version  # 应显示版本号

# 5. Git配置了吗？
git config --global user.name   # 应显示你的名字
git config --global user.email  # 应显示你的邮箱

# 6. VS Code 能打开吗？
code --version # Mac上可能需要先装shell命令：打开VS Code → Cmd+Shift+P → 输入 "shell command" → 选 "Install 'code' command in PATH"
```

6项全部通过 → ✅ 环境就绪，可以开始写代码了。

### 常见问题排查

| 问题 | 解决 |
|---|---|
| `node` 命令不存在 | 重启终端/CMD，或重新安装Node.js（安装时勾选"Add to PATH"） |
| npm安装包时报错 `ETIMEDOUT` | 镜像源没改，执行 `npm config set registry https://registry.npmmirror.com` |
| Git显示乱码 | Windows：`git config --global core.quotepath false` |
| VS Code打开后是英文 | 装了Chinese插件后，按 `Ctrl/⌘ + Shift + P` → 输入 "display language" → 选中文 → 重启 |

---

## 六、开发目录结构建议

### 推荐你的电脑目录

```
~/projects/              ← 所有项目放这里
  ├── my-first-app/      ← 第一个产品
  ├── landing-page/      ← 落地页
  └── side-project/      ← 试验项目
```

### 每个项目的标准结构

当AI帮你生成项目时，推荐使用这个目录结构（让AI初始化）：

```
my-product/
├── index.html           ← 主页面
├── style.css            ← 样式
├── script.js            ← 逻辑
├── assets/              ← 图片/图标
├── .gitignore           ← 告诉Git忽略哪些文件
└── README.md            ← 项目说明
```

### .gitignore 模板

创建一个 `.gitignore` 文件，放入以下内容（告诉Git不要上传这些文件）：

```
node_modules/
.env
.DS_Store
dist/
.vscode/
```

---

## 总纲

> 开发环境不是越全越好，是越少越好。少到你只需要30分钟就能在任何一台新电脑上重建整个环境。

**30分钟清单**：
1. 装 Node.js → 改 npm 淘宝镜像（10分钟）
2. 装 VS Code → 装3个插件 → 设置自动保存（10分钟）
3. 装 Git → 配名字邮箱（5分钟）
4. 跑环境检验 → 6项全过（2分钟）
5. 建好项目目录结构（3分钟）

环境就绪。下一步：用3条命令创建你的第一个Hello World项目（见节点08）。

---

*最后修订：2026年5月9日*
