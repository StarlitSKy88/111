# OPC节点百科3.0

> 让一个人公司创业变得简单。

## 项目概述

OPC节点百科 — 纯OPC（一人公司）创业从0到1的完整节点导航系统。

**核心原则**：
- 绝对纯OPC：删除所有需要员工、合伙人、融资的内容
- 生死线前置：所有能导致项目死亡的节点放在最前面
- 严格线性：按照"想法→工具→开发→注册→支付→上线→赚钱"顺序排列

## 57个节点体系（8个阶段）

| 阶段 | 数量 | 说明 |
|:---|:---|:---|
| 产品验证与准备 | 6个 | 想法筛选，原型设计，MVP定义 |
| 环境搭建与Hello World | 4个 | 开发环境，Git版本控制，后端连接 |
| 核心功能开发 | 7个 | 认证系统，三大核心功能，支付集成 |
| 测试与修复 | 4个 | 自测流程，灰度测试，Bug修复，性能优化 |
| 上线准备 | 6个 | 内容填充，公司注册，域名ICP，网站部署 |
| 正式上线 | 3个 | 提交审核，审核问题处理，正式发布 |
| 上线后迭代与运营 | 13个 | 数据分析，冷启动，内容营销，定价策略 |
| 并行支撑层 | 14个 | 银行税务，企业邮箱，商标版权，安全合规 |

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 启动服务
bash start.sh

# 3. 访问
http://localhost:3001
```

## 技术栈

- 前端: Vanilla JS + Tailwind CDN
- 后端: Node.js + Express
- AI: DeepSeek V4 Flash (腾讯TokenHub)
- 支付: 微信支付 (人工确认)

## 项目结构

```
opcone/
├── index.html              # 落地页（节点百科首页）
├── app.js                   # 前端逻辑
├── api/
│   ├── analyze.js           # Express API服务器
│   └── data-store.js        # JSON数据存储
├── data/
│   ├── nodes.json           # 57个节点数据
│   ├── results.json          # 测试结果
│   └── payments.json         # 支付记录
├── questions.json           # OPC适配测试题
├── nodes/                    # 57个节点内容页
│   ├── 01-opc-fit-test/
│   ├── 02-personal-resources/
│   └── ...                  # 共57个节点
├── content-drafts/           # 节点内容草稿
└── admin.html               # 管理后台
```

---

*OPC节点百科3.0 | Phase 1.5 Planning*