# OPC节点百科3.0 需求规格文档

> **版本**: v2.0.0
> **日期**: 2026-05-06
> **状态**: PHASE 1.5 PLANNING
> **设计风格**: Japanese Ma (間) 极简主义 — 墨色暗色模式

---

## 1. 产品概述

### 1.1 产品定位

OPC节点百科 — 纯OPC（一人公司）创业从0到1的完整节点导航系统。

**核心价值**：让一个人公司创业变得简单
- 更完整的地图：40个纯OPC节点，覆盖创业全流程
- 可信赖的向导：AI实时生成内容 + 人工验证

### 1.2 核心原则

1. **绝对纯OPC**：删除所有需要员工、合伙人、融资的内容
2. **生死线前置**：所有能导致项目死亡的节点放在最前面
3. **严格线性**：按照"想法→工具→开发→注册→支付→上线→赚钱"顺序排列
4. **优先级明确**：前22个核心必做（30天走完上线赚钱），后18个扩展可选

### 1.3 技术栈

| 层级 | 技术 |
|:---|:---|
| 前端 | Vanilla JS + Tailwind CDN |
| 后端 | Node.js + Express |
| 数据库 | JSON文件存储 |
| AI | DeepSeek V4 Flash (腾讯TokenHub) |
| 支付 | 微信支付 (人工确认) |

---

## 2. 页面结构与功能地图

### 2.1 页面清单（Phase 1.5目标）

| 页面 | 路由 | 描述 |
|:---|:---|:---|
| 落地页 | `/` | 节点百科首页，Linear风格全屏节点列表 |
| 节点详情页 | `/nodes/:slug` | 单个节点完整内容，AI生成 |
| 测试答题页 | `/test` | 10道OPC适配度测试题 |
| 结果页 | `/result/:id` | AI分析报告 + 分享/下载 |
| 服务市场 | `/services` | 付费服务列表 |
| 管理后台 | `/admin` | 查看测试结果和支付记录 |

### 2.2 节点分类体系

| 分类 | 节点数 | 说明 |
|:---|:---|:---|
| 核心必做（0-1阶段） | 22 | 30天上线赚钱必须完成 |
| 扩展可选（1-10阶段） | 12 | 按需选择 |
| 扩展可选（10+阶段） | 6 | 规模化后考虑 |

---

## 3. 40个节点清单（OPC节点百科3.0）

### 核心必做节点（22个）：0-1阶段，30天上线赚钱

| ID | 标题 | Slug | 分类 | 难度 | 标准价 | 咨询价 |
|:--|:---|:---|:---|:---|:---|:---|
| 01 | OPC适配测试 | opc-fit-test | 0-1 | 入门 | — | ¥299 |
| 02 | 个人能力与资源盘点 | personal-resources | 0-1 | 入门 | — | ¥299 |
| 03 | 创业想法筛选与验证 | idea-validation | 0-1 | 入门 | — | ¥499 |
| 04 | 个体户vs有限公司选择 | business-structure | 0-1 | 入门 | ¥299 | ¥299 |
| 05 | AI编码工具选型 | ai-tools | 0-1 | 进阶 | — | ¥299 |
| 06 | MVP范围锁定 | mvp-scope | 0-1 | 入门 | — | ¥299 |
| 07 | 核心功能技术验证 | tech-validation | 0-1 | 进阶 | — | ¥299 |
| 08 | 公司注册全流程 | company-registration | 0-1 | 入门 | ¥299 | ¥299 |
| 09 | 银行开户与商户号申请 | bank-account | 0-1 | 入门 | — | ¥299 |
| 10 | 税务报到与发票管理 | tax-invoice | 0-1 | 入门 | — | ¥299 |
| 11 | 域名购买与ICP备案 | domain-icp | 0-1 | 入门 | — | ¥299 |
| 12 | 网站部署与SSL | website-deployment | 0-1 | 进阶 | — | ¥299 |
| 13 | 国内支付接入 | payment-access | 0-1 | 进阶 | — | ¥299 |
| 14 | OPC现金流管理 | cashflow | 0-1 | 入门 | — | ¥399 |
| 15 | 创业财务基础 | finance-basics | 0-1 | 入门 | — | ¥299 |
| 16 | 定价策略 | pricing | 0-1 | 进阶 | — | ¥399 |
| 17 | 上线前检查清单 | launch-checklist | 0-1 | 入门 | — | ¥199 |
| 18 | 冷启动获客 | cold-start | 0-1 | 进阶 | — | ¥299 |
| 19 | AI客户服务体系 | ai-customer-service | 0-1 | 进阶 | — | ¥399 |
| 20 | 客户体验与口碑管理 | customer-experience | 0-1 | 进阶 | — | ¥299 |
| 39 | 政府政策与创业补贴 | government-policy | 0-1 | 入门 | — | ¥299 |
| 40 | OPC客户异议应对 | customer-objections | 0-1 | 进阶 | — | ¥299 |

### 扩展可选节点（18个）：1-10阶段，按需选择

| ID | 标题 | Slug | 分类 | 难度 | 标准价 | 咨询价 |
|:--|:---|:---|:---|:---|:---|:---|
| 21 | 内容营销与SEO | content-marketing | 1-10 | 进阶 | — | ¥299 |
| 22 | 广告投放入门 | advertising | 1-10 | 进阶 | — | ¥399 |
| 23 | 私域流量运营 | private-traffic | 1-10 | 进阶 | — | ¥299 |
| 24 | 用户转介绍机制 | referral | 1-10 | 进阶 | — | ¥299 |
| 25 | 外包策略与执行 | outsourcing | 1-10 | 进阶 | — | ¥299 |
| 26 | 商标申请 | trademark | 1-10 | 进阶 | ¥199 | ¥299 |
| 27 | 软件著作权登记 | copyright | 1-10 | 进阶 | — | ¥299 |
| 28 | 广告合规 | ad-compliance | 1-10 | 入门 | — | ¥299 |
| 29 | 企业邮箱搭建 | business-email | 1-10 | 入门 | — | ¥199 |
| 30 | 数据备份与恢复 | data-backup | 1-10 | 进阶 | — | ¥299 |
| 31 | 服务器安全防护 | server-security | 1-10 | 高级 | — | ¥399 |
| 32 | 海外支付方案 | global-payment | 1-10 | 进阶 | — | ¥299 |
| 33 | 个人精力管理 | energy-management | 1-10 | 入门 | — | ¥299 |
| 34 | 年度税务筹划 | tax-planning | 1-10 | 进阶 | — | ¥499 |
| 35 | 微信小程序部署 | wechat-miniapp | 1-10 | 进阶 | — | ¥499 |
| 36 | 产品迭代与复盘 | product-iteration | 1-10 | 入门 | — | ¥199 |
| 37 | 收入多元化 | income-diversification | 10+ | 进阶 | — | ¥399 |
| 38 | 项目退出机制 | exit-plan | 10+ | 入门 | — | ¥299 |

---

## 4. 设计系统规格

### 4.1 色彩系统 (Ma 墨色暗色模式)

| Token | 色值 | 用途 |
|:---|:---|:---|
| `--bg` | #111110 | 页面背景 |
| `--surface` | #1A1A18 | 卡片/模态框背景 |
| `--text-primary` | #F0EDE6 | 主要文字 |
| `--text-secondary` | #7A7670 | 次要文字 |
| `--text-tertiary` | #4A4644 | 三级文字/禁用态 |
| `--accent` | #C0392B | 朱红强调色(最多1处/页) |
| `--accent-dark` | #a33025 | 按钮hover态 |
| `--line` | #2A2A28 | 分隔线/边框 |
| `--success` | #22c55e | 成功状态 |
| `--danger` | #ef4444 | 错误状态 |

### 4.2 字体系统

| 用途 | 字号 | 字重 | 字间距 | 行高 |
|:---|:---|:---|:---|:---|
| Display | clamp(2.5rem, 12vw, 8rem) | 200 | -0.04em | 1.05 |
| Headline | clamp(1.125rem, 5vw, 1.75rem) | 300 | -0.015em | 1.5 |
| Body | 0.875rem / 0.9375rem | 400 | 0.02em / 0.03em | 1.85 / 1.9 |
| Label | 0.625rem | 400 | 0.2em | — |
| 超大数字 | clamp(4rem, 22vw, 10rem) | 100 | -0.06em | 1 |

### 4.3 动画规格

| 动画 | 时长 | 缓动 | 用途 |
|:---|:---|:---|:---|
| Fade Up | 0.6s | cubic-bezier(0.25, 0.46, 0.45, 0.94) | 元素入场 |
| Hover Opacity | 0.4s | ease | 文字链接hover |
| Modal | 0.3s | ease | 模态框出现 |

### 4.4 禁止的设计模式

- 圆角药丸按钮 (border-radius: 0 或 max 2px)
- 原色CTA (蓝/绿按钮)
- 玻璃拟态/背景模糊
- 对称三列卡片网格
- 引人注目的弹跳/弹簧动画

---

## 5. API端点清单

| 端点 | 方法 | 描述 | 认证 |
|:---|:---|:---|:---|
| `/health` | GET | 健康检查 | 无 |
| `/api/nodes` | GET | 获取所有节点 | 无 |
| `/api/nodes/:slug` | GET | 获取单个节点 | 无 |
| `/api/analyze` | POST | OPC适配度分析 | API_KEY |
| `/api/generate-node-content` | POST | AI生成节点内容 | API_KEY |
| `/api/confirm-payment` | POST | 支付确认 | 无 |
| `/api/stats` | GET | 统计数据 | 无 |
| `/api/admin/results` | GET | 所有结果(管理) | 无 |

---

## 6. 文件结构（Phase 1.5目标）

```
opcone/
├── index.html              # 落地页（节点百科首页）
├── nodes/
│   └── [slug].html         # 节点详情页（每个节点独立HTML）
├── test.html               # OPC适配测试页
├── services.html           # 服务市场页
├── admin.html              # 管理后台
├── app.js                  # 前端逻辑
├── api/
│   ├── analyze.js          # Express API服务器
│   └── data-store.js       # JSON数据存储
├── data/
│   ├── nodes.json          # 40个节点数据
│   ├── results.json        # 测试结果存储
│   └── payments.json       # 支付记录存储
├── questions.json          # 10道测试题
├── wechat-pay.jpg          # 微信收款码
├── wechat-qr.jpg           # 客服二维码
├── package.json
├── start.sh                # 启动脚本
├── VERSION                 # 版本号 (2.0.0.0)
├── CHANGELOG.md
└── docs/
    ├── SPEC.md             # 本文档
    ├── USER-PRODUCT-MAP.md # 用户产品地图
    ├── opc-design-2026-05-06.md
    ├── harness-ready.md
    └── opc-launch-map.md
```

---

## 7. Phase 1.5 里程碑

| 阶段 | 时间 | 目标 |
|:---|:---|:---|
| 规划期 | 第1-2周 | plan-ceo-review, plan-eng-review, design-shotgun, writing-plans |
| 执行期 | 第3-8周 | 落地页重构、节点详情页、路由系统 |
| 验证期 | 第9-10周 | 40节点全部完成、AI内容生成、测试通过 |

---

## 8. 验收检查清单

### 8.1 功能验收

- [ ] 落地页正确显示40个节点
- [ ] 节点按分类分组（0-1 / 1-10 / 10+）
- [ ] 节点筛选功能正常
- [ ] 节点详情页正确打开
- [ ] 节点独立URL路由正常
- [ ] AI内容正确生成
- [ ] 测试流程完整可用
- [ ] 支付流程完整可用

### 8.2 设计验收

- [ ] 暗色主题正确应用
- [ ] 色彩变量全部使用CSS变量
- [ ] 无圆角药丸按钮
- [ ] 动画时长≥400ms
- [ ] 响应式布局正常

---

*文档版本: 2.0.0 | 生成时间: 2026-05-06 | 状态: PHASE 1.5 PLANNING*