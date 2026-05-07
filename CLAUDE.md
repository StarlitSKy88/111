# CLAUDE.md

## 项目概述

**OPC节点百科3.0** — 纯OPC（一人公司）创业从0到1的完整节点导航系统

### 核心定位
- **使命**：让一个人公司创业变得简单
- **核心价值**：更完整的地图（40个纯OPC节点）+ 可信赖的向导（AI实时内容）
- **差异化**：AI实时监控 + 社区贡献者验证 + 非标准化高接触服务

### 核心原则
1. **绝对纯OPC**：删除所有需要员工、合伙人、融资的内容
2. **生死线前置**：所有能导致项目死亡的节点放在最前面
3. **严格线性**：按照"想法→工具→开发→注册→支付→上线→赚钱"顺序排列
4. **优先级明确**：前22个核心必做（30天走完上线赚钱），后18个扩展可选

### 目标用户
1. **空白用户** — 有创业想法但不知道从哪开始，需要「地图」
2. **进行中用户** — 某个节点卡住，需要具体解法
3. **效率用户** — 有经验，想降低时间和金钱成本

### 产品架构
```
用户层：节点百科（免费）+ 社区（免费）+ 服务市场（付费）
服务层：AI内容引擎 + 用户画像 + 服务调度 + 内容审核 + 订单管理 + 数据分析
数据层：内容数据库 + 用户数据库 + 搜索索引 + 向量数据库
```

---

## OPC节点百科3.0体系（40节点）

### 核心必做节点（22个）：0-1阶段，30天上线赚钱

| ID | 标题 | Slug |
|:--|:---|:---|
| 01 | OPC适配测试 | opc-fit-test |
| 02 | 个人能力与资源盘点 | personal-resources |
| 03 | 创业想法筛选与验证 | idea-validation |
| 04 | 个体户vs有限公司选择 | business-structure |
| 05 | AI编码工具选型 | ai-tools |
| 06 | MVP范围锁定 | mvp-scope |
| 07 | 核心功能技术验证 | tech-validation |
| 08 | 公司注册全流程 | company-registration |
| 09 | 银行开户与商户号申请 | bank-account |
| 10 | 税务报到与发票管理 | tax-invoice |
| 11 | 域名购买与ICP备案 | domain-icp |
| 12 | 网站部署与SSL | website-deployment |
| 13 | 国内支付接入 | payment-access |
| 14 | OPC现金流管理 | cashflow |
| 15 | 创业财务基础 | finance-basics |
| 16 | 定价策略 | pricing |
| 17 | 上线前检查清单 | launch-checklist |
| 18 | 冷启动获客 | cold-start |
| 19 | AI客户服务体系 | ai-customer-service |
| 20 | 客户体验与口碑管理 | customer-experience |
| 39 | 政府政策与创业补贴 | government-policy |
| 40 | OPC客户异议应对 | customer-objections |

### 扩展可选节点（18个）：1-10阶段，按需选择

| ID | 标题 | Slug |
|:--|:---|:---|
| 21 | 内容营销与SEO | content-marketing |
| 22 | 广告投放入门 | advertising |
| 23 | 私域流量运营 | private-traffic |
| 24 | 用户转介绍机制 | referral |
| 25 | 外包策略与执行 | outsourcing |
| 26 | 商标申请 | trademark |
| 27 | 软件著作权登记 | copyright |
| 28 | 广告合规 | ad-compliance |
| 29 | 企业邮箱搭建 | business-email |
| 30 | 数据备份与恢复 | data-backup |
| 31 | 服务器安全防护 | server-security |
| 32 | 海外支付方案 | global-payment |
| 33 | 个人精力管理 | energy-management |
| 34 | 年度税务筹划 | tax-planning |
| 35 | 微信小程序部署 | wechat-miniapp |
| 36 | 产品迭代与复盘 | product-iteration |
| 37 | 收入多元化 | income-diversification |
| 38 | 项目退出机制 | exit-plan |

---

## 核心交付物

| 文件 | 说明 |
|:---|:---|
| `docs/SPEC.md` | OPC节点百科3.0需求规格 |
| `docs/opc-launch-map.md` | 40节点、37个收费点、4阶段路线图 |
| `docs/opc-design-2026-05-06.md` | 完整设计文档 |
| `data/nodes.json` | 40个节点数据 |
| `questions.json` | OPC适配测试题 |
| `index.html` | 落地页（节点百科首页） |
| `app.js` | 前端逻辑 |

---

## AI内容引擎

- **运行频率**：7×24，每10分钟检查更新
- **数据源**：政府网站、云厂商文档、工具文档、行业报告
- **流程**：数据源监控 → AI生成 → 人工审核 → 发布
- **贡献者系统**：GitHub风格（提交→审核→合并发布）

---

## 商业模式

| 来源 | 占比 | 说明 |
|:---|:---:|:---|
| 服务市场 | 60% | 代办+服务 |
| 会员订阅 | 25% | 全包会员、年度订阅 |
| 工具产品 | 15% | 服务器、域名渠道价差 |

**定价策略**：
- 标准化代办（低价引流）：公司注册¥299、商标申请¥199
- 非标服务（护城河）：陪跑¥999/天、咨询¥499/小时、全包¥29999

---

## Phase 1.5 路线图

| 阶段 | 时间 | 状态 | 目标 |
|:---|:---|:---|:---|
| Phase 1 | 第1-2周 | ✅ 完成 | 数据迁移、API端点、前端适配 |
| Phase 2 | 第3-4周 | ✅ 完成 | 管理后台 admin-app (React + Vite) |
| Phase 3 | 第5-8周 | 🔄 进行中 | 用户系统 + 内容生成 |
| Phase 4 | 第9-10周 | ⬜ 待开始 | 优化与验证 |

### Phase 3 当前进度

**已完成**：
- ✅ 用户注册/登录 API (POST /api/auth/register, POST /api/auth/login)
- ✅ JWT token 认证中间件
- ✅ 订阅系统 (月付9.9元/月，年付99元/年)
- ✅ 前端登录注册 UI + 订阅弹窗
- ✅ 节点访问控制 (01免费，02-40需订阅)
- ✅ 支付占位符 API

**待完成**：
- ⬜ 节点内付费配置 (admin-app 定价配置页)
- ⬜ 40节点内容生成 (每个≥5000字)
- ⬜ 节点 index.html 更新

### 技术栈
- 前端：Vanilla JS + Tailwind CDN + http-server (port 3000)
- 后端：Express + Node.js (port 3001)
- 管理后台：admin-app (React + Vite, port 5173)
- AI模型：deepseek-v4-flash (腾讯TokenHub)

### API 端点
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/subscription - 获取订阅状态
- POST /api/subscribe - 创建订阅
- GET /api/access/:slug - 检查节点访问权限
- POST /api/pay/subscribe - 支付占位符
- POST /api/pay/callback - 支付回调占位符

---

## 环境配置

### API配置
- 模型：`deepseek-v4-flash`
- API端点：`https://tokenhub.tencentmaas.com/v1/chat/completions`
- Key：`sk-UX6ezaZKGktnbbino4FJahcQRtYp3yomoZnHOHbdtZ1xh4Vp`

### 启动步骤
1. 填入API Key到 `api/.env`
2. 执行 `bash start.sh`

---

## 技能路由

| 场景 | 技能 |
|:---|:---|
| 产品构思/头脑风暴 | /office-hours |
| 策略/范围/商业 | /plan-ceo-review |
| 架构/技术 | /plan-eng-review |
| 设计系统/视觉 | /design-shotgun |
| 详细实现计划 | /writing-plans |
| Bug/错误 | /investigate |
| 测试/QA | /qa |
| 代码审查 | /review |
| Ship/部署 | /ship |

---

## 阶段里程碑

| 时间 | 检查点 | 通过标准 |
|:---|:---|:---|
| 第30天 | 落地页完成 | 日UV > 100，22个核心节点全部可访问 |
| 第60天 | 节点内容完善 | AI生成内容覆盖 > 80%节点 |
| 第90天 | 商业模型验证 | 付费转化率 > 3%，月收入 > ¥10,000 |

---

*本项目文档由 OPC节点百科3.0 规划流程生成 | 更新: 2026-05-06*