# Phase 1.5 路由与页面实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 OPC节点百科3.0 添加 Hash 路由支持，使节点详情页可分享（`/#/nodes/:slug`），同时保持现有状态机和模态框功能完整。

**架构（修订版）：**
- 渐进增强：在现有 app.js 状态机基础上添加 Hash 路由层
- 保留所有现有 `render()` 函数和状态机逻辑
- Hash 路由只负责 `/#/nodes/:slug`（打开节点模态框）一个可分享链接
- 节点详情页继续使用现有模态框（`openNodeModal`），Hash 路由用于生成可分享的深层链接
- 浏览器后退/前进按钮通过 `hashchange` 事件支持

**技术栈：** Vanilla JS (ES6+) + Tailwind CDN + Node.js/Express API

---

## 1. 现有代码库分析

### 现有架构
- `app.js`：1089行，单文件包含所有逻辑
- 状态机： `state.showLanding` + `render()` 控制页面切换
- 节点列表：`renderNodesGrid()` 在 index.html 的 `#nodes-grid` 容器渲染
- 节点详情：`openNodeModal()` 打开模态框，现有功能完整
- 无 Hash 路由，浏览器后退/前进按钮无效

### 现有函数（保持不变）
- `renderLanding()`, `renderQuestion()`, `renderResult()`, `renderLoading()`
- `render()`, `renderServiceIntro()`, `renderCompanyServiceIntro()`, `renderNeedsMappingIntro()`
- `renderNodesGrid()`, `openNodeModal()`, `closeNodeModal()`, `generateNodeContent()`
- `selectService()`, `startTest()`, `restart()`, `backToLanding()`
- 所有状态管理：`state = { showLanding, currentQuestion, answers, results, ... }`

### nodes.json 数据结构
```json
{
  "nodes": [
    {
      "id": 1,
      "title": "OPC适配测试",
      "slug": "opc-fit-test",
      "summary": "入口节点，测试你是否适合做OPC...",
      "difficulty": "核心必做",
      "category": "第一章：认知与起点",
      "price_consult": 299
    }
  ]
}
```

---

## 2. 路由定义

| Hash 路由 | 行为 | 实现方式 |
|:---|:---|:---|
| `#/` 或空 | 落地页 | 现有 `render()` 状态机 |
| `#/nodes/:slug` | 打开节点模态框 | `openNodeModal(nodeId)` + 设置 `SELECTED_NODE` |
| 其他 | 忽略，回退到现有状态 | 现有逻辑 |

**注意：** 原计划中的 `nodes.html`、`services.html` 文件不存在，不应创建。

---

## 3. 任务列表

### 任务 1：添加 Hash 路由系统

**文件：**
- 修改：`app.js`（在文件末尾添加路由层）

- [ ] **步骤 1：添加 navigateTo 辅助函数**

```javascript
/**
 * Hash 路由导航
 * @param {string} path - 路由路径，如 'nodes/opc-fit-test' 或 ''
 */
function navigateTo(path) {
  window.location.hash = '#/' + path;
}
```

- [ ] **步骤 2：添加 hashchange 事件监听器**

在 `DOMContentLoaded` 事件监听器之后添加：

```javascript
// Hash 路由处理 — 支持浏览器后退/前进按钮
window.addEventListener('hashchange', handleHashRoute);

function handleHashRoute() {
  const hash = window.location.hash || '#/';

  // 解析 hash：/#/nodes/opc-fit-test
  if (hash.startsWith('#/nodes/')) {
    const slug = hash.replace('#/nodes/', '');
    const node = window.NODES?.find(n => n.slug === slug);
    if (node) {
      window.SELECTED_NODE = node;
      openNodeModal(node.id);
    }
  }
}
```

- [ ] **步骤 3：在节点网格中更新点击处理**

修改 `renderNodesGrid()` 中的 onclick，使节点可以被分享为深层链接：

```javascript
// 在节点点击时添加 hash 路由，同时打开模态框
onclick="window.location.hash='#/nodes/${node.slug}';openNodeModal(${node.id})"
```

或者使用 navigateTo（如果想在同一函数内处理）：

```javascript
onclick="navigateTo('nodes/${node.slug}');setTimeout(()=>openNodeModal(${node.id}),50)"
```

- [ ] **步骤 4：Commit**

```bash
git add app.js
git commit -m "feat: add hash-based routing for node detail sharing"
```

---

### 任务 2：更新节点模态框以支持 URL 回退

**文件：**
- 修改：`app.js`（修改 `openNodeModal` 函数）

- [ ] **步骤 1：更新 openNodeModal 设置 hash**

当模态框打开时，同步更新 hash URL（用于分享）：

```javascript
function openNodeModal(nodeId) {
  const modal = document.getElementById('node-modal');
  if (!modal) return;

  const node = window.NODES.find(n => n.id === nodeId);
  if (!node) return;

  window.SELECTED_NODE = node;

  // 更新 hash URL（用于分享链接）
  if (node.slug) {
    history.replaceState(null, '', '#/nodes/' + node.slug);
  }

  // 填充标题和分类
  document.getElementById('modal-category').textContent =
    `${node.difficulty} · ${node.category}`;
  document.getElementById('modal-title').textContent = node.title;

  // 显示 loading
  document.getElementById('modal-content').innerHTML =
    '<div class="spinner" style="margin: 2rem auto;"></div>';

  // 显示模态框
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // 调用 AI 生成内容
  generateNodeContent(node);
}
```

- [ ] **步骤 2：更新 closeNodeModal 恢复 hash**

当模态框关闭时，恢复到落地页：

```javascript
function closeNodeModal() {
  const modal = document.getElementById('node-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';

  // 恢复 hash 到落地页
  history.replaceState(null, '', '#/');
}
```

- [ ] **步骤 3：Commit**

```bash
git add app.js
git commit -m "feat: sync modal state with hash URL for shareable links"
```

---

### 任务 3：测试验证

**文件：**
- 无变更文件，用于验证

- [ ] **步骤 1：启动服务器验证**

```bash
# 终端 1：启动 API 服务器
cd /Users/opc-1/Downloads/O/opcone
node api/server.js

# 终端 2：启动静态文件服务器
cd /Users/opc-1/Downloads/O/opcone
npx serve . -p 3000
```

- [ ] **步骤 2：验证 Hash 路由功能**

在浏览器中测试：

1. 访问 `http://localhost:3000/#/nodes/opc-fit-test`
   - 预期：节点模态框自动打开，显示 OPC适配测试 节点内容

2. 点击浏览器后退按钮
   - 预期：模态框关闭，回到落地页

3. 在落地页点击任意节点
   - 预期：模态框打开，同时 URL 更新为 `/#/nodes/[slug]`

4. 复制当前 URL 到新标签页
   - 预期：新标签页打开相同节点的模态框

- [ ] **步骤 3：验证现有功能未破坏**

1. 访问 `http://localhost:3000/`
   - 预期：落地页正常显示，节点列表渲染

2. 点击"开始测试"按钮
   - 预期：测试流程正常，可答题

3. 完成测试后查看结果
   - 预期：结果页正常显示，分数动画正常

---

## 4. 架构决策记录

### 决策 1：渐进增强 vs 重建
- **选择：** 渐进增强
- **原因：** 现有代码库完整且工作正常，重建会破坏现有功能；渐进增强只需添加 ~50 行代码

### 决策 2：模态框 vs 独立页
- **选择：** 模态框
- **原因：** 现有 `openNodeModal()` 已实现完整功能，改成独立页需要重建；模态框更适合"先浏览后详情"的场景

### 决策 3：history.replaceState vs window.location.hash
- **选择：** `history.replaceState`
- **原因：** 避免产生过多历史记录（每次打开模态框都产生一条记录）；replaceState 只更新 URL 不产生历史

---

## 5. 注意事项

### 不要做的事
- 不要创建 `nodes.html`、`services.html` 等不存在的文件
- 不要修改现有 `render()` 函数和状态机逻辑
- 不要用 `app.innerHTML = config.render()` 替换整个页面
- 不要删除现有的 `renderNodesGrid()` 和 `openNodeModal()` 函数

### 已知限制
- 节点内容通过 `generateNodeContent()` 调用 AI API 生成，需要后端 `/api/generate-node-content` 端点
- 测试结果通过 `/api/analyze` 端点获取，需要后端支持
- 无单元测试框架（建议添加）

---

*计划版本：v2.0.0 | 更新：2026-05-06 | 状态：plan-eng-review 完成*
