# 节点08：Hello World 启动

> **面向OPC**：你的开发环境已经装好了。现在用3条命令创建第一个项目，然后在AI的帮助下写出第一个页面——从"零"到"看到东西在浏览器里运行"，只需要10分钟。

---

## 一、3条命令创建第一个项目

打开 VS Code → 按 `Ctrl/⌘ + ~` 打开内置终端 → 依次执行：

```bash
# 第1条：创建项目文件夹并进入
mkdir my-first-app && cd my-first-app

# 第2条：初始化npm项目（一路回车，全部默认）
npm init -y

# 第3条：在VS Code中打开这个文件夹
code .
```

3条命令后，你的VS Code左侧文件面板应该显示一个空文件夹，里面只有一个 `package.json` 文件。

### 发生了什么

| 命令 | 干了什么 |
|---|---|
| `mkdir my-first-app` | 在你的电脑上创建了一个文件夹叫 `my-first-app` |
| `cd my-first-app` | 进入这个文件夹 |
| `npm init -y` | 创建了 `package.json`——这是你项目的"身份证"，记录项目名、版本号、依赖包 |
| `code .` | 在VS Code中打开当前文件夹（`.` 代表"当前目录"） |

---

## 二、AI生成第一个HTML页面

### 把下面这段话发给你的AI工具

**用Trae / Cursor / Claude Code** 的对话窗口，粘贴以下Prompt：

```
帮我创建一个单文件Web应用。

要求：
1. 文件名：index.html
2. 内容：一个简洁的欢迎页面
3. 页面中心显示："Hello，这是OPC的第一个产品"
4. 下面一个按钮，写着"点我试试"
5. 点击按钮后，弹出一个提示框，显示"按钮被点击了！你成功运行了第一个交互功能。"
6. 页面背景深色（#111110），文字白色，按钮红色（#C0392B）
7. 全部内容居中显示
8. 移动端适配（viewport）
```

### 你会看到AI生成类似这样的代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的第一个产品</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #111110;
      color: #fff;
      font-family: sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container { text-align: center; }
    h1 { font-size: 28px; margin-bottom: 24px; }
    button {
      background: #C0392B;
      color: #fff;
      border: none;
      padding: 12px 32px;
      font-size: 18px;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover { opacity: 0.85; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello，这是OPC的第一个产品</h1>
    <button onclick="handleClick()">点我试试</button>
  </div>
  <script>
    function handleClick() {
      alert('按钮被点击了！你成功运行了第一个交互功能。');
    }
  </script>
</body>
</html>
```

### 把代码保存到你的项目里

在VS Code中：
1. 左侧文件面板右键 → "新建文件"
2. 命名为 `index.html`
3. 把AI生成的代码粘贴进去
4. 按 `Ctrl/⌘ + S` 保存

---

## 三、本地预览

### 方法一：直接双击（最快）

在文件管理器里找到 `my-first-app/index.html` → 双击 → 自动用浏览器打开。

### 方法二：用VS Code Live Preview

1. VS Code左侧扩展 → 搜索 `Live Preview`（微软官方出品）→ 安装
2. 右键 `index.html` → 选择 "Show Preview"
3. VS Code右侧会打开预览窗口，修改代码实时刷新

### 方法三：启动本地服务器（最规范）

在VS Code终端中输入：

```bash
npx serve .
```

终端会显示一个地址，比如 `http://localhost:3000`。用浏览器打开它。

**为什么用本地服务器**：双击打开用的是 `file://` 协议，某些功能（比如调用API、使用JavaScript模块）会受限。`npx serve` 启动的是真正的HTTP服务器，和线上环境一致。

---

## 四、理解HTML/CSS/JS三件套

你不需要成为前端工程师，但需要能看懂AI写的代码在干什么。以下是只需要30秒就够用的理解：

```
┌────────────────────────────────────────────┐
│                index.html                   │
│                                            │
│  <style>...</style>  ← CSS：管"长什么样"     │
│  颜色、大小、间距、居中...                    │
│                                            │
│  <body>...</body>    ← HTML：管"有什么"       │
│  标题、按钮、图片、输入框...                   │
│                                            │
│  <script>...</script> ← JS：管"干什么"        │
│  点击后弹出提示、提交数据、跳转页面...           │
│                                            │
└────────────────────────────────────────────┘
```

### 对应到你的页面

| 你看到的效果 | 是哪个在起作用 |
|---|---|
| "Hello，这是OPC的第一个产品"这几个字 | HTML（`<h1>` 标签） |
| 深色背景、白色文字、红色按钮、居中对齐 | CSS（`<style>` 里的代码） |
| 点击按钮弹出提示框 | JS（`<script>` 里的 `alert(...)`） |

### 你现在不需要记语法

你只需要能认出"这段是CSS"、"这段是HTML"、"这段是JS"。以后再遇到AI生成的代码，你能大致判断"这是改样式的还是改逻辑的"就够了。

---

## 五、第一次用AI修改页面

### 把下面的Prompt发给AI

```
修改 index.html 页面：

1. 在标题下面增加一行小字："2026年，一个人也可以做出产品。"
2. 小字颜色用灰色（#888），字号14px
3. 按钮文字改成"再来一次"
4. 点击按钮后，除了弹出提示，还要把页面标题改成"你做到了！"

只修改这个文件，不要动其他部分。
```

### AI会告诉你改哪里

AI会给出修改后的代码。你复制到 `index.html` 中，保存，刷新浏览器——就能看到效果。

### 改完了不满意？

继续跟AI说：

```
按钮颜色太暗了，换成亮红色（#FF3B30），字号加大到20px。
```

**关键认知**：你不是在"写代码"，你是在"指挥AI改代码"。这就是OPC的核心工作方式。

---

## 六、你刚刚完成的事

| 你做了什么 | 对应的开发者术语 |
|---|---|
| 创建了 `index.html` | 创建了"前端入口文件" |
| 写了HTML标签 | "结构化内容" |
| 写了CSS样式 | "样式定义" |
| 写了JS交互 | "事件处理" |
| 在浏览器里看到页面 | "本地部署与预览" |
| 用AI修改了页面 | "AI辅助迭代开发" |

**从技术层面，你已经完成了一个完整的前端开发循环。**

---

## 总纲

> Hello World 的意义不是做出来的页面有多好看——而是你第一次完成了"想 → 说 → 看"的闭环。

三件套速记：
- **HTML** → 页面上有什么
- **CSS** → 页面长什么样
- **JS** → 页面能干什么

下一步：学习Git，把你的第一个页面提交到代码仓库（见节点09）。

---

*最后修订：2026年5月9日*
