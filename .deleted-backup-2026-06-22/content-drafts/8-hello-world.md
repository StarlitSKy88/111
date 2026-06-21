---
node_id: 8
persona: ranmu
cta_type: wechat
keywords: [Hello, World, 启动, Next, Vercel]
---

# 节点08：Hello World 启动

> **面向OPC**：1 小时内做出你的**第一个可访问的 Web 页面**。这个节点不求完美，只求**让"我能做出来"这件事变成事实**。

---

## 一、5 步上线第一个页面

| 步骤 | 动作 | 时间 |
|:---:|:---|:---:|
| 1 | 装 Next.js 脚手架 | 5 min |
| 2 | 改首页内容 | 5 min |
| 3 | 推到 GitHub | 5 min |
| 4 | 接 Vercel 自动部署 | 5 min |
| 5 | 拿到你的网站 URL | 1 min |

**合计 21 分钟**。如果你做了 1 小时以上，说明卡了，去节点 55 找人帮。

---

## 二、Step 1：创建 Next.js 项目

```bash
# 进入你想放项目的目录
cd ~/Documents/projects

# 创建 Next.js 项目（用官方脚手架）
npx create-next-app@latest my-opc-app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

# 进入项目
cd my-opc-app
```

**所有选项默认回车**，除了上面指定的外。

---

## 三、Step 2：改首页

打开 `app/page.tsx`，全部删掉，粘贴：

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#111110] text-white">
      <div className="text-center">
        <h1 className="text-6xl font-light mb-4">我的 OPC 项目</h1>
        <p className="text-[#7A7670]">这是我的第一个 Web 页面</p>
      </div>
    </main>
  );
}
```

**注意**：`bg-[#111110]` 是暗色 Ma 間设计，不是默认白底。

---

## 四、Step 3：本地运行

```bash
npm run dev
```

打开 http://localhost:3000 看到你的页面 = 成功。

如果 30 秒还没出现 = 哪里出错了，看 terminal 报错。

---

## 五、Step 4-5：推 GitHub + Vercel

### 4a. 创建 GitHub 仓库

1. 打开 github.com → New repository
2. 名字：`my-opc-app`
3. **不要**勾 Add README / .gitignore
4. 点 Create

### 4b. 推送代码

```bash
git add .
git commit -m "feat: hello world"
git branch -M main
git remote add origin https://github.com/你的用户名/my-opc-app.git
git push -u origin main
```

### 4c. 接 Vercel

1. 打开 vercel.com → Sign up with GitHub
2. Import `my-opc-app` 仓库
3. 点 Deploy（默认配置就行）
4. 等待 60 秒 → 拿到 `https://my-opc-app-xxx.vercel.app`

**这个 URL 就是你的第一个网站**。把它发到朋友圈/小红书/微信群，你就是一个"有产品"的人了。

---

## 六、最常见的 3 个报错

| 报错 | 原因 | 解法 |
|:---|:---|:---|
| `EADDRINUSE :::3000` | 3000 端口被占 | `lsof -i:3000` 找到进程 kill |
| `Cannot find module 'next'` | node_modules 没装 | `rm -rf node_modules && npm install` |
| `git push` 失败 | 远程仓库没配 | 检查 GitHub repo URL 是否正确 |

---

## 七、检查清单

- [ ] 本地 `npm run dev` 能看到页面
- [ ] 代码推到 GitHub
- [ ] Vercel 自动部署成功
- [ ] 拿到 Vercel URL，能在手机访问
- [ ] 截图发朋友圈庆祝 🎉（虽然不让你用 emoji，但这是重大里程碑）

---

## 节点资源链接

- 节点07：开发环境安装
- 节点09：Git版本控制初始化
- 节点55：外包策略与执行
