# OPC MVP 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将现有OPC适配自测落地页转型为OPC节点百科落地页，展示21个节点并提供2个收费服务（公司注册代办¥299 + 需求梳理¥299）

**架构：** 在现有index.html + app.js基础上进行增量修改，不引入新的技术栈。落地页包含3个主要模块：节点展示（免费内容）、服务购买（微信支付）、AI内容增强。

**技术栈：** 现有技术栈不变（HTML + Vanilla JS + Tailwind CDN + DeepSeek API）

---

## 概述

### 当前状态
- 现有OPC适配自测落地页（10道题 + AI分析报告）
- 微信支付收款流程（¥9.9手册）
- 日式Ma极简设计风格

### P0目标
1. 将落地页从"OPC适配自测"转型为"OPC节点百科"
2. 展示21个OPC创业节点
3. 提供2个收费服务入口

### 不在P0范围
- 用户系统
- 社区功能
- AI引擎7×24爬取
- 会员体系
- 第三方服务商入驻

---

## 文件结构

```
opcone/
├── index.html          # 落地页（修改：新增节点展示、服务入口）
├── app.js              # 前端逻辑（修改：新增服务选择流程）
├── questions.json       # 测试题（保留）
├── api/
│   └── analyze.js       # AI分析API（修改：复用现有结构）
├── data/
│   └── nodes.json      # [新建] 21个节点的静态内容
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-05-06-opc-mvp-implementation.md  # 本计划
```

---

## 任务列表

### 阶段1：节点内容

- [ ] **任务 1：创建节点数据文件 `data/nodes.json`**
  - 创建：`data/nodes.json`
  - 包含21个OPC节点的静态内容

- [ ] **任务 2：整理21个节点内容**
  - 修改：`data/nodes.json`
  - 每个节点包含：id, title, summary, difficulty, category

### 阶段2：落地页改造

- [ ] **任务 3：在落地页新增"21节点展示"区块**
  - 修改：`index.html`
  - 在Hero下方添加节点展示区域

- [ ] **任务 4：在落地页新增"服务入口"区块**
  - 修改：`index.html`
  - 添加2个收费服务的介绍和购买入口

- [ ] **任务 5：创建节点详情页（模态框）**
  - 修改：`app.js`, `index.html`
  - 点击节点展示AI生成的内容摘要

### 阶段3：服务流程

- [ ] **任务 6：实现服务选择流程**
  - 修改：`app.js`
  - 用户选择服务类型（公司注册/需求梳理）

- [ ] **任务 7：复用微信支付流程**
  - 修改：`app.js`, `index.html`
  - 复用现有微信支付流程（¥9.9流程改为¥299）

- [ ] **任务 8：更新支付后服务确认**
  - 修改：`app.js`
  - 支付成功后显示服务确认信息

### 阶段4：AI内容增强

- [ ] **任务 9：为节点生成AI内容摘要**
  - 修改：`data/nodes.json`
  - 调用DeepSeek API为每个节点生成内容摘要

- [ ] **任务 10：实现AI内容懒加载**
  - 修改：`app.js`
  - 节点点击时动态加载AI内容

### 阶段5：测试验证

- [ ] **任务 11：手动测试完整流程**
  - 测试：节点浏览 → 服务选择 → 支付 → 确认

---

## 详细任务

### 任务 1：创建节点数据文件 `data/nodes.json`

**文件：**
- 创建：`data/nodes.json`

**步骤：**

- [ ] **步骤 1：创建 `data/nodes.json` 文件**

```json
{
  "nodes": [
    {
      "id": 1,
      "title": "产品定位",
      "slug": "product-positioning",
      "summary": "确定你的OPC要做什么产品或服务，核心价值是什么",
      "difficulty": "入门",
      "category": "0-1",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 2,
      "title": "公司注册",
      "slug": "company-registration",
      "summary": "注册个体户或有限公司，选择经营范围",
      "difficulty": "入门",
      "category": "0-1",
      "price_standard": 299,
      "price_consult": 299
    },
    {
      "id": 3,
      "title": "银行开户",
      "slug": "bank-account",
      "summary": "开设对公账户，绑定微信商户号",
      "difficulty": "入门",
      "category": "0-1",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 4,
      "title": "税务登记",
      "slug": "tax-registration",
      "summary": "税务报到、申请发票、了解税率",
      "difficulty": "入门",
      "category": "0-1",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 5,
      "title": "云服务器",
      "slug": "cloud-server",
      "summary": "选购云服务器，搭建开发环境",
      "difficulty": "进阶",
      "category": "0-1",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 6,
      "title": "域名购买",
      "slug": "domain-purchase",
      "summary": "购买域名，备案解析",
      "difficulty": "入门",
      "category": "0-1",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 7,
      "title": "网站部署",
      "slug": "website-deployment",
      "summary": "部署前端项目，配置HTTPS",
      "difficulty": "进阶",
      "category": "0-1",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 8,
      "title": "商标申请",
      "slug": "trademark-application",
      "summary": "申请商标保护品牌",
      "difficulty": "进阶",
      "category": "0-1",
      "price_standard": 199,
      "price_consult": 299
    },
    {
      "id": 9,
      "title": "社保公积金",
      "slug": "social-security",
      "summary": "了解灵活就业社保公积金缴纳",
      "difficulty": "入门",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 10,
      "title": "票据管理",
      "slug": "invoice-management",
      "summary": "了解发票获取、报销、记账",
      "difficulty": "入门",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 11,
      "title": "年度汇算",
      "slug": "annual-settlement",
      "summary": "个税年度汇算清缴",
      "difficulty": "进阶",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 12,
      "title": "团队组建",
      "slug": "team-building",
      "summary": "招募合伙人或兼职外包",
      "difficulty": "高级",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 13,
      "title": "融资规划",
      "slug": "fundraising-planning",
      "summary": "了解融资时机和流程",
      "difficulty": "高级",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 14,
      "title": "股权设计",
      "slug": "equity-design",
      "summary": "设计股权结构",
      "difficulty": "高级",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 15,
      "title": "合同模板",
      "slug": "contract-templates",
      "summary": "准备常用合同模板",
      "difficulty": "进阶",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 16,
      "title": "数据备份",
      "slug": "data-backup",
      "summary": "设置自动化数据备份",
      "difficulty": "进阶",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 17,
      "title": "安全防护",
      "slug": "security-protection",
      "summary": "配置防火墙、安全监控",
      "difficulty": "高级",
      "category": "1-10",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 18,
      "title": "SEO优化",
      "slug": "seo-optimization",
      "summary": "搜索引擎优化基础",
      "difficulty": "进阶",
      "category": "10+",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 19,
      "title": "广告投放",
      "slug": "advertising",
      "summary": "了解广告投放基础",
      "difficulty": "进阶",
      "category": "10+",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 20,
      "title": "私域运营",
      "slug": "private-traffic",
      "summary": "微信私域流量运营",
      "difficulty": "进阶",
      "category": "10+",
      "price_standard": null,
      "price_consult": 299
    },
    {
      "id": 21,
      "title": "用户增长",
      "slug": "user-growth",
      "summary": "建立用户增长体系",
      "difficulty": "高级",
      "category": "10+",
      "price_standard": null,
      "price_consult": 299
    }
  ]
}
```

- [ ] **步骤 2：保存文件**

运行：`cat > data/nodes.json << 'EOF'
{...}
EOF`

预期：`data/nodes.json` 创建成功

- [ ] **步骤 3：Commit**

```bash
git add data/nodes.json
git commit -m "feat: add 21 OPC nodes data structure"
```

---

### 任务 2：更新节点内容

**文件：**
- 修改：`data/nodes.json`

- [ ] **步骤 1：为每个节点补充AI内容摘要字段**

运行：手动编辑 `data/nodes.json`，为每个节点添加 `ai_summary` 字段

预期：每个节点包含完整的 `ai_summary`（后续由DeepSeek API生成）

---

### 任务 3：在落地页新增节点展示区块

**文件：**
- 修改：`index.html`

- [ ] **步骤 1：在Hero下方添加节点展示区块**

在 `index.html` 的 `<body>` 中找到 `<div id="app" tabindex="-1"></div>` 之前添加：

```html
<!-- 节点百科区块 -->
<section id="nodes-section" style="padding: 4rem 0; background: var(--surface);">
  <div class="ma-layout">
    <div class="ma-center">
      <div style="margin-bottom: 2rem;">
        <div class="text-label" style="margin-bottom: 0.5rem; color: var(--accent);">OPC节点百科</div>
        <h2 class="text-headline" style="margin-bottom: 0.5rem;">21个创业节点</h2>
        <p class="text-body" style="color: var(--text-secondary);">
          从0到1，你需要解决21个节点。<br>
          点击任意节点，获取AI整理的详细攻略。
        </p>
      </div>
      
      <!-- 难度筛选 -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <button class="action" onclick="filterNodes('all')" id="filter-all">全部</button>
        <button class="action" onclick="filterNodes('入门')" id="filter-入门">入门</button>
        <button class="action" onclick="filterNodes('进阶')" id="filter-进阶">进阶</button>
        <button class="action" onclick="filterNodes('高级')" id="filter-高级">高级</button>
      </div>
      
      <!-- 节点网格 -->
      <div id="nodes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1px; background: var(--line);">
        <!-- 动态生成 -->
      </div>
    </div>
  </div>
</section>
```

- [ ] **步骤 2：验证HTML语法**

运行：打开 `index.html` 检查新增区块是否正确

预期：页面可以正常加载

- [ ] **步骤 3：Commit**

```bash
git add index.html
git commit -m "feat: add nodes section to landing page"
```

---

### 任务 4：新增服务入口区块

**文件：**
- 修改：`index.html`

- [ ] **步骤 1：在节点百科下方添加服务入口区块**

在 `index.html` 的 `</body>` 前添加：

```html
<!-- 服务市场区块 -->
<section id="services-section" style="padding: 4rem 0; background: var(--bg);">
  <div class="ma-layout">
    <div class="ma-center">
      <div style="margin-bottom: 2rem;">
        <div class="text-label" style="margin-bottom: 0.5rem; color: var(--accent);">服务市场</div>
        <h2 class="text-headline" style="margin-bottom: 0.5rem;">需要帮助？</h2>
        <p class="text-body" style="color: var(--text-secondary);">
          标准化代办 or 1对1咨询，选择适合你的服务方式
        </p>
      </div>
      
      <div style="display: grid; gap: 1rem;">
        <!-- 服务A：公司注册代办 -->
        <div style="background: var(--surface); border: 1px solid var(--line); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <div class="text-label" style="margin-bottom: 0.25rem; color: var(--accent);">标准化服务</div>
              <h3 style="font-size: 1.125rem; font-weight: 400; color: var(--text-primary);">公司注册代办</h3>
            </div>
            <div style="font-size: 1.5rem; color: var(--accent); font-weight: 300;">¥299</div>
          </div>
          <p class="text-body" style="color: var(--text-secondary); margin-bottom: 1rem;">
            专业团队代办，最快3个工作日完成。<br>
            含：名称核准、营业执照、税务登记。
          </p>
          <button onclick="selectService('company-registration')" class="btn-pdf" style="width: 100%;">
            立即购买
          </button>
        </div>
        
        <!-- 服务B：需求梳理 -->
        <div style="background: var(--surface); border: 1px solid var(--accent); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <div class="text-label" style="margin-bottom: 0.25rem; color: var(--accent);">非标准化服务</div>
              <h3 style="font-size: 1.125rem; font-weight: 400; color: var(--text-primary);">需求梳理</h3>
              <div style="font-size: 0.625rem; color: var(--accent); letter-spacing: 0.1em; margin-top: 0.25rem;">推荐</div>
            </div>
            <div style="font-size: 1.5rem; color: var(--accent); font-weight: 300;">¥299</div>
          </div>
          <p class="text-body" style="color: var(--text-secondary); margin-bottom: 1rem;">
            1对1视频通话，45-60分钟。<br>
            帮你梳理当前卡点，找到最适合你的OPC路径。
          </p>
          <button onclick="selectService('needs-mapping')" class="btn-pdf" style="width: 100%;">
            立即预约
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **步骤 2：Commit**

```bash
git add index.html
git commit -m "feat: add services section with 2 paid services"
```

---

### 任务 5：创建节点详情模态框

**文件：**
- 修改：`index.html`, `app.js`

- [ ] **步骤 1：在 `index.html` 的 `<div id="app">` 后添加模态框**

```html
<!-- 节点详情模态框 -->
<div id="node-modal" class="hidden" style="
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem 0;
">
  <div style="
    max-width: 600px;
    margin: 0 auto;
    background: var(--surface);
    border: 1px solid var(--line);
    padding: 2rem;
  ">
    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <div class="text-label" id="modal-category" style="margin-bottom: 0.25rem;"></div>
        <h3 id="modal-title" style="font-size: 1.25rem; font-weight: 400;"></h3>
      </div>
      <button onclick="closeNodeModal()" style="
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
      ">×</button>
    </div>
    
    <div id="modal-content" class="text-body" style="color: var(--text-secondary); margin-bottom: 1.5rem;">
      <div class="spinner" style="margin: 2rem auto;"></div>
    </div>
    
    <div style="border-top: 1px solid var(--line); padding-top: 1.5rem;">
      <button onclick="consultForNode()" class="btn-pdf" style="width: 100%;">
        咨询此节点 · ¥299
      </button>
    </div>
  </div>
</div>
```

- [ ] **步骤 2：在 `app.js` 中添加模态框逻辑**

```javascript
// 节点模态框
function openNodeModal(nodeId) {
  const modal = document.getElementById('node-modal');
  const nodesGrid = document.getElementById('nodes-grid');
  
  // 查找节点数据
  const node = window.NODES.find(n => n.id === nodeId);
  if (!node) return;
  
  window.SELECTED_NODE = node;
  
  // 填充标题和分类
  document.getElementById('modal-category').textContent = 
    `${node.difficulty} · ${node.category}`;
  document.getElementById('modal-title').textContent = node.title;
  
  // 显示loading
  document.getElementById('modal-content').innerHTML = 
    '<div class="spinner" style="margin: 2rem auto;"></div>';
  
  // 显示模态框
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  // 调用AI生成内容
  generateNodeContent(node);
}

function closeNodeModal() {
  const modal = document.getElementById('node-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

async function generateNodeContent(node) {
  const contentEl = document.getElementById('modal-content');
  
  try {
    const response = await fetch('/api/generate-node-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        node_id: node.id,
        title: node.title,
        summary: node.summary
      })
    });
    
    if (!response.ok) throw new Error('生成失败');
    
    const data = await response.json();
    contentEl.innerHTML = data.content;
  } catch (error) {
    // 降级：显示节点摘要
    contentEl.innerHTML = `
      <p style="margin-bottom: 1rem;">${node.summary}</p>
      <p class="text-label" style="color: var(--text-tertiary);">AI内容生成中...</p>
    `;
  }
}

function consultForNode() {
  const node = window.SELECTED_NODE;
  if (!node) return;
  
  closeNodeModal();
  selectService('needs-mapping');
}
```

- [ ] **步骤 3：Commit**

```bash
git add index.html app.js
git commit -m "feat: add node detail modal with AI content generation"
```

---

### 任务 6：实现服务选择流程

**文件：**
- 修改：`app.js`

- [ ] **步骤 1：在 `app.js` 中添加服务选择状态**

```javascript
const state = {
  // ... 现有状态
  currentQuestion: 0,
  answers: {},
  results: null,
  loading: false,
  userWechatId: '',
  paid: false,
  error: null,
  showLanding: true,
  // 新增
  selectedService: null,  // 'company-registration' | 'needs-mapping' | null
  selectedNode: null       // 用户点击的节点（如果有）
};
```

- [ ] **步骤 2：添加 `selectService` 函数**

```javascript
function selectService(serviceType) {
  state.selectedService = serviceType;
  state.showLanding = false;
  renderServiceIntro();
}

function renderServiceIntro() {
  const app = document.getElementById('app');
  
  if (state.selectedService === 'company-registration') {
    app.innerHTML = renderCompanyServiceIntro();
  } else if (state.selectedService === 'needs-mapping') {
    app.innerHTML = renderNeedsMappingIntro();
  }
}

function renderCompanyServiceIntro() {
  return `
    <div class="ma-layout">
      <div class="ma-center">
        <div style="padding: 3rem 0;">
          <div class="text-label" style="margin-bottom: 0.5rem; color: var(--accent);">标准化服务</div>
          <h2 class="text-headline" style="margin-bottom: 1rem;">公司注册代办</h2>
          
          <div style="margin-bottom: 2rem;">
            <div style="font-size: 2rem; color: var(--accent); margin-bottom: 0.5rem;">¥299</div>
            <div class="text-label" style="color: var(--text-tertiary);">市场价 ¥800-1500</div>
          </div>
          
          <div class="text-body" style="color: var(--text-secondary); margin-bottom: 2rem;">
            <p style="margin-bottom: 1rem;"><strong style="color: var(--text-primary);">包含服务：</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 0.5rem;">· 名称核准</li>
              <li style="margin-bottom: 0.5rem;">· 营业执照办理</li>
              <li style="margin-bottom: 0.5rem;">· 税务登记</li>
              <li style="margin-bottom: 0.5rem;">· 银行开户指导</li>
            </ul>
            <p style="margin-top: 1rem;"><strong style="color: var(--text-primary);">时长：</strong>3-5个工作日</p>
          </div>
          
          <div style="margin-bottom: 2rem; padding: 1rem; border: 1px solid var(--line);">
            <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">适合谁</div>
            <p class="text-body" style="color: var(--text-secondary);">
              第一次创业，不知道如何注册公司<br>
              嫌流程麻烦，想省心中介代办
            </p>
          </div>
          
          <button onclick="goToPayment()" class="btn-pdf" style="width: 100%; margin-bottom: 1rem;">
            立即购买 · ¥299
          </button>
          <button onclick="backToLanding()" class="action" style="display: block; text-align: center;">
            返回首页
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderNeedsMappingIntro() {
  return `
    <div class="ma-layout">
      <div class="ma-center">
        <div style="padding: 3rem 0;">
          <div class="text-label" style="margin-bottom: 0.5rem; color: var(--accent);">非标准化服务</div>
          <h2 class="text-headline" style="margin-bottom: 1rem;">需求梳理</h2>
          
          <div style="margin-bottom: 2rem;">
            <div style="font-size: 2rem; color: var(--accent); margin-bottom: 0.5rem;">¥299</div>
            <div class="text-label" style="color: var(--text-tertiary);">1对1视频通话</div>
          </div>
          
          <div class="text-body" style="color: var(--text-secondary); margin-bottom: 2rem;">
            <p style="margin-bottom: 1rem;"><strong style="color: var(--text-primary);">服务内容：</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 0.5rem;">· 45-60分钟1对1视频通话</li>
              <li style="margin-bottom: 0.5rem;">· 帮你梳理当前卡在哪个节点</li>
              <li style="margin-bottom: 0.5rem;">· 找到最适合你的OPC路径</li>
              <li style="margin-bottom: 0.5rem;">· 获得个性化的行动清单</li>
            </ul>
          </div>
          
          <div style="margin-bottom: 2rem; padding: 1rem; border: 1px solid var(--line);">
            <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">你会得到</div>
            <p class="text-body" style="color: var(--text-secondary);">
              一份完整的OPC路径图<br>
              知道下一步应该做什么<br>
              避免常见的创业坑
            </p>
          </div>
          
          <button onclick="goToPayment()" class="btn-pdf" style="width: 100%; margin-bottom: 1rem;">
            立即预约 · ¥299
          </button>
          <button onclick="backToLanding()" class="action" style="display: block; text-align: center;">
            返回首页
          </button>
        </div>
      </div>
    </div>
  `;
}

function backToLanding() {
  state.selectedService = null;
  state.showLanding = true;
  render();
}
```

- [ ] **步骤 3：Commit**

```bash
git add app.js
git commit -m "feat: add service selection flow"
```

---

### 任务 7：复用微信支付流程

**文件：**
- 修改：`app.js`

- [ ] **步骤 1：修改 `goToPayment` 函数支持不同金额**

```javascript
function goToPayment() {
  const service = state.selectedService;
  const amount = service === 'company-registration' ? 299 : 299;
  
  showPaymentFlow(amount);
}

function showPaymentFlow(amount) {
  const container = document.getElementById('manual-content');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 1.5rem 0;">
      <!-- Step 1: Enter WeChat ID -->
      <div id="step-wechat" style="text-align: center;">
        <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">Step 1/3 — 输入你的微信</div>
        <p class="text-body" style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          ${getServiceConfirmText()}
        </p>
        <input
          type="text"
          id="wechat-input"
          placeholder="请输入你的微信号"
          value="${state.userWechatId}"
          style="
            width: 100%;
            max-width: 280px;
            padding: 0.875rem 1rem;
            background: var(--surface);
            border: 1px solid var(--line);
            color: var(--text-primary);
            font-size: 0.875rem;
            text-align: center;
            outline: none;
          "
        >
        <div style="margin-top: 1rem;">
          <button onclick="goToPaymentQR()" class="btn-pdf" style="background: var(--text-tertiary);">
            下一步
          </button>
        </div>
      </div>
    </div>
  `;
}

function getServiceConfirmText() {
  const service = state.selectedService;
  if (service === 'company-registration') {
    return '购买"公司注册代办"服务后，我会添加你的微信';
  } else if (service === 'needs-mapping') {
    return '购买"需求梳理"服务后，我会添加你的微信预约时间';
  }
  return '手册完成后，我会添加你的微信发送给你';
}
```

- [ ] **步骤 2：修改 `showPaymentQR` 支持不同金额**

```javascript
function showPaymentQR() {
  const container = document.getElementById('manual-content');
  if (!container) return;
  
  const service = state.selectedService;
  const serviceName = service === 'company-registration' ? '公司注册代办' : '需求梳理';

  container.innerHTML = `
    <div style="padding: 1.5rem 0; text-align: center;">
      <!-- Step 2: Payment -->
      <div class="text-label" style="margin-bottom: 1rem; color: var(--text-tertiary);">Step 2/3 — 扫码支付</div>

      <div style="display: inline-block; padding: 0.75rem; background: #fff; margin-bottom: 1.5rem;">
        <img src="wechat-pay.jpg" alt="微信支付" style="width: 220px; height: auto; display: block;">
      </div>

      <div style="font-size: 1.5rem; color: var(--accent); margin-bottom: 0.5rem;">
        ¥299
      </div>
      <div class="text-label" style="margin-bottom: 1.5rem; color: var(--text-tertiary);">
        ${serviceName}
      </div>

      <div style="margin-bottom: 1.5rem;">
        <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">我的微信</div>
        <div style="font-size: 1rem; color: var(--accent); letter-spacing: 0.1em;">bcrf2025</div>
      </div>

      <div style="padding: 1rem; border: 1px solid var(--line); margin-bottom: 1.5rem; text-align: left;">
        <div class="text-label" style="margin-bottom: 0.5rem; color: var(--text-tertiary);">支付后请完成</div>
        <ol style="list-style: decimal; padding-left: 1.25rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.8;">
          <li>截图付款凭证</li>
          <li>添加微信 <span style="color: var(--accent);">bcrf2025</span></li>
          <li>发送截图和服务类型</li>
          <li>我会确认并进入服务流程</li>
        </ol>
      </div>

      <button onclick="confirmPayment()" class="btn-pdf" style="background: var(--success);">
        我已支付 ✓
      </button>
    </div>
  `;
}
```

- [ ] **步骤 3：Commit**

```bash
git add app.js
git commit -m "feat: adapt WeChat payment flow for different services"
```

---

### 任务 8：更新支付后服务确认

**文件：**
- 修改：`app.js`

- [ ] **步骤 1：修改 `confirmPayment` 显示服务确认信息**

```javascript
function confirmPayment() {
  const container = document.getElementById('manual-content');
  if (!container) return;

  const service = state.selectedService;
  const serviceName = service === 'company-registration' ? '公司注册代办' : '需求梳理';
  const nextSteps = service === 'company-registration' 
    ? [
        '添加微信后，发送你的公司名称',
        '我们会在3-5个工作日内完成注册',
        '完成前会与你确认营业执照副本'
      ]
    : [
        '添加微信后，告诉我你目前卡在哪一步',
        '我会与你预约45-60分钟的视频通话时间',
        '通话前会发送问题清单给你准备'
      ];

  fetch('/api/confirm-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      result_id: state.results?.id || 'service-' + Date.now(),
      wechat_id: state.userWechatId,
      service_type: service,
      amount: 299
    })
  }).catch(err => console.error('Payment confirm error:', err));

  container.innerHTML = `
    <div style="padding: 1.5rem 0; text-align: center;">
      <div class="text-label" style="margin-bottom: 1rem; color: var(--success);">✓ 购买成功</div>

      <div style="margin-bottom: 1.5rem;">
        <p class="text-body" style="color: var(--text-secondary);">
          服务：<br>
          <span style="color: var(--accent); font-size: 1.125rem;">${serviceName}</span>
        </p>
      </div>

      <div style="padding: 1.5rem; border: 1px solid var(--line); text-align: left; margin-bottom: 1.5rem;">
        <div class="text-label" style="margin-bottom: 0.75rem; color: var(--text-tertiary);">接下来</div>
        <ol style="list-style: decimal; padding-left: 1.25rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.8;">
          ${nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <button onclick="showWechatQR()" class="action">查看我的微信</button>
        <button onclick="backToLanding()" class="action">返回首页</button>
      </div>
    </div>
  `;
}
```

- [ ] **步骤 2：Commit**

```bash
git add app.js
git commit -m "feat: show service-specific confirmation after payment"
```

---

### 任务 9：为节点生成AI内容摘要

**文件：**
- 修改：`api/analyze.js`

- [ ] **步骤 1：在 `api/analyze.js` 中添加节点内容生成API**

```javascript
// 节点内容生成API
app.post('/api/generate-node-content', async (req, res) => {
  const { node_id, title, summary } = req.body;
  
  if (!node_id || !title) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  try {
    const prompt = `请为以下OPC创业节点生成详细的内容摘要：

节点：${title}
简要说明：${summary}

请生成500字左右的详细摘要，包含：
1. 为什么这个节点重要
2. 常见错误和避坑指南
3. 推荐的操作步骤
4. 相关资源和工具

格式要求：使用Markdown格式，层次清晰`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: '你是一个专业的OPC创业顾问，擅长用简洁清晰的语言解释复杂的创业知识。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error('AI API调用失败');
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || summary;
    
    res.json({ 
      content,
      node_id,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate node content error:', error);
    res.status(500).json({ error: '生成失败，请稍后重试' });
  }
});
```

- [ ] **步骤 2：Commit**

```bash
git add api/analyze.js
git commit -m "feat: add node content generation API"
```

---

### 任务 10：实现AI内容懒加载

**文件：**
- 修改：`app.js`

- [ ] **步骤 1：添加节点网格渲染函数**

```javascript
async function loadNodes() {
  try {
    const response = await fetch('data/nodes.json');
    const data = await response.json();
    window.NODES = data.nodes;
    renderNodesGrid(data.nodes);
  } catch (error) {
    console.error('Load nodes error:', error);
  }
}

function renderNodesGrid(nodes, filter) {
  const grid = document.getElementById('nodes-grid');
  if (!grid) return;
  
  const filtered = filter && filter !== 'all' 
    ? nodes.filter(n => n.difficulty === filter)
    : nodes;
  
  grid.innerHTML = filtered.map(node => `
    <div style="background: var(--surface); padding: 1.25rem; cursor: pointer;" 
         onclick="openNodeModal(${node.id})">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div class="text-label" style="color: var(--accent);">
          ${String(node.id).padStart(2, '0')}
        </div>
        <div class="text-label" style="color: var(--text-tertiary);">
          ${node.difficulty}
        </div>
      </div>
      <h3 style="font-size: 1rem; font-weight: 400; color: var(--text-primary); margin-bottom: 0.5rem;">
        ${node.title}
      </h3>
      <p class="text-body" style="font-size: 0.8125rem; color: var(--text-secondary);">
        ${node.summary}
      </p>
      ${node.price_consult ? `
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--line);">
          <span class="text-label" style="color: var(--text-tertiary);">咨询 </span>
          <span style="color: var(--accent);">¥${node.price_consult}</span>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function filterNodes(difficulty) {
  // 更新按钮状态
  document.querySelectorAll('[id^="filter-"]').forEach(btn => {
    btn.style.color = 'var(--text-secondary)';
    btn.style.borderBottomColor = 'var(--line)';
  });
  const activeBtn = document.getElementById('filter-' + difficulty);
  if (activeBtn) {
    activeBtn.style.color = 'var(--text-primary)';
    activeBtn.style.borderBottomColor = 'var(--accent)';
  }
  
  renderNodesGrid(window.NODES, difficulty);
}
```

- [ ] **步骤 2：在 `DOMContentLoaded` 中加载节点**

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await loadNodes();  // 新增：加载节点数据
  render();
});
```

- [ ] **步骤 3：Commit**

```bash
git add app.js
git commit -m "feat: implement lazy loading for node content"
```

---

### 任务 11：手动测试完整流程

- [ ] **步骤 1：启动本地服务器**

运行：`bash start.sh`

- [ ] **步骤 2：测试节点展示**

操作：滚动到"21个创业节点"区块
预期：显示21个节点网格，可按难度筛选

- [ ] **步骤 3：测试节点详情**

操作：点击任意节点
预期：弹出模态框，显示节点详情

- [ ] **步骤 4：测试服务选择**

操作：点击"公司注册代办"或"需求梳理"
预期：显示服务介绍页面

- [ ] **步骤 5：测试支付流程**

操作：点击"立即购买"→ 输入微信 → 点击"下一步"
预期：显示¥299支付二维码

- [ ] **步骤 6：测试支付确认**

操作：点击"我已支付"
预期：显示服务-specific的确认信息

---

## 自检清单

### 规格覆盖度
- [x] 21个节点展示
- [x] 2个收费服务入口
- [x] 服务介绍页面
- [x] 微信支付流程
- [x] 支付确认页面
- [x] AI内容生成（节点详情）

### 占位符扫描
- [x] 无"TODO"占位符
- [x] 无"待定"内容
- [x] 所有API endpoint已定义
- [x] 所有UI状态已处理

### 类型一致性
- [x] `state.selectedService` 类型正确
- [x] `window.NODES` 数据结构与 `data/nodes.json` 一致
- [x] API响应格式一致

---

## 实施检查点

| 阶段 | 任务 | 状态 |
|:---|:---|:---:|
| 阶段1 | 节点数据 | □ |
| 阶段2 | 落地页改造 | □ |
| 阶段3 | 服务流程 | □ |
| 阶段4 | AI内容增强 | □ |
| 阶段5 | 测试验证 | □ |

---

*本计划由 /writing-plans 生成*
*基于 ceo-review.md 的P0范围*

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 1 issue fixed (API_KEY naming) |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

### Issue Resolution

| # | Issue | Severity | Resolution |
|:---|:---|:---:|:---|
| 1 | API_KEY 环境变量命名不一致 | P1 | ✅ 已修复：统一为 `API_KEY` |

### Coverage Analysis

| Area | Coverage | Gaps |
|:---|:---:|:---|
| Code paths | 50% | 3 untested branches |
| User flows | 21% | 17 untested paths |
| LLM integration | N/A | No eval suite |

### Technical Debt

| Item | Priority | Note |
|:---|:---:|:---|
| 遗留支付流程代码 | P2 | 两套支付流程并存 |
| 金额硬编码 | P3 | 未来扩展需改常量 |
| AI降级消息不准确 | P2 | 用户看到"生成中"但实际是失败 |

### Recommendations

1. **立即** (P1): 无 - 已修复
2. **短期** (P2): 添加节点数据缓存避免每次刷新请求
3. **中期** (P3): 添加 E2E 测试覆盖核心用户流程

### Outside Voice
Not requested (skip requested by user)
