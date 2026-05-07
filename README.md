# OPC节点百科3.0

> 让一个人公司创业变得简单。

## 项目概述

OPC节点百科 — 纯OPC（一人公司）创业从0到1的完整节点导航系统。

**核心原则**：
- 绝对纯OPC：删除所有需要员工、合伙人、融资的内容
- 生死线前置：所有能导致项目死亡的节点放在最前面
- 严格线性：按照"想法→工具→开发→注册→支付→上线→赚钱"顺序排列

## 40个节点体系

| 分类 | 数量 | 说明 |
|:---|:---|:---|
| 核心必做（0-1阶段） | 22个 | 30天上线赚钱必须完成 |
| 扩展可选（1-10阶段） | 12个 | 按需选择 |
| 扩展可选（10+阶段） | 6个 | 规模化后考虑 |

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
│   ├── nodes.json           # 40个节点数据
│   ├── results.json          # 测试结果
│   └── payments.json         # 支付记录
├── questions.json           # OPC适配测试题
├── admin.html               # 管理后台
└── docs/
    ├── SPEC.md              # 需求规格
    ├── opc-launch-map.md    # 节点路线图
    └── harness-ready.md     # 部署文档
```

---

*OPC节点百科3.0 | Phase 1.5 Planning*