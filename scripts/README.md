# scripts/ 目录索引

> **最后更新**：2026-06-04 · **维护人**：蕾姆
> **用途**：content-drafts → nodes HTML 自动化 + 节点 layout 一致性 + 飞书集成

## 当前 4 个脚本

| 脚本 | 何时用 | 输入 | 输出 | 调用顺序 |
|:---|:---|:---|:---|:---:|
| **generate-nodes.js** | 一次性内容生成（5/11 旧版）| `content-drafts/{id}-{slug}.md` | `nodes/{id}-{slug}/index.html` | ① |
| **apply-layout-classes.py** | 注入共享 CSS link（6/2 新版，已跑过）| 节点目录 | 节点 `<head>` 加 `<link>` | ② |
| **inject-layout-class.py** | 注入 `layout-{type}` class（6/1 新版）| 节点目录 | 第一个 `<div class="layout">` 加 class | ③ |
| **create-feishu-bitable.py** | 飞书 5 表创建（待补）| `feishu-schemas/5-tables.json` | 飞书多维表格 5 张 + table_id | ④ |

## 完整调用链

```
content-drafts/{id}-{slug}.md                    # Markdown 源（29 篇）
        │
        ▼  [1] node scripts/generate-nodes.js
nodes/{id}-{slug}/index.html                      # 新建 HTML
        │
        ▼  [2] python3 scripts/apply-layout-classes.py
注入 <link rel="stylesheet" href="../_design-tokens.css">
        │
        ▼  [3] python3 scripts/inject-layout-class.py
注入 <div class="layout layout-{type}">
        │
        ▼  [4] python3 scripts/create-feishu-bitable.py
飞书多维表格 5 张 + .env 写入 FEISHU_TABLE_IDS
```

## 单脚本速查

### `generate-nodes.js`
- **Node.js** ≥ 18（仅 fs/path，无外部依赖）
- **覆盖节点**：当前只映射 16 个（13-22、24-26、28-30、32、34），**缺 41 个**（见 `nodes-mapping-TODO.md`）
- **跑法**：`node scripts/generate-nodes.js`
- **输出日志**：`Found: ...md` / `NOT FOUND: ...md` / `Generated: .../index.html`

### `apply-layout-classes.py`
- **Python 3** + 标准库
- **跳过逻辑**：已包含 `_design-tokens.css` 的节点不重复注入
- **LAYOUT_MAP**：5 种布局类型（classic / steps / policy / tools / calc）
- **跑法**：`python3 scripts/apply-layout-classes.py`
- **已跑过**：2026-06-02（脚本注释"56 节点已成功"）

### `inject-layout-class.py`
- **Python 3** + 标准库
- **跳过逻辑**：已含 `layout-{type}` 的节点不重复
- **只改第一个** `<div class="layout">`，不影响子容器
- **跑法**：`python3 scripts/inject-layout-class.py`

### `create-feishu-bitable.py`
- **Python 3** + `lark-oapi` 1.5.3（已装）
- **前置条件**：
  1. 飞书开放平台注册应用：https://open.feishu.cn/app
  2. 申请 scopes：`bitable:app:readonly` + `bitable:app`
  3. 填入 `.env`：`FEISHU_APP_ID=cli_xxx` / `FEISHU_APP_SECRET=xxx`
- **跑法**：`python3 scripts/create-feishu-bitable.py`
- **输出**：5 张表创建完成 + `.env` 追加 `FEISHU_TABLE_IDS={"selection":"..."}`

## 飞书 5 表 Schema（`feishu-schemas/5-tables.json`）

| 表 | 用途 | 主要字段 |
|:---|:---|:---|
| 选题库 | a1-scan + a3-reverse 输出 | title / source_url / formula / persona / status |
| 内容排期 | b1-publish 调度 | node_id / platform / publish_at / draft_url / status |
| 粉丝管理 | c1+c2+c3 输出 | wechat_id / tag / source_node / first_seen / ltv |
| 销售管道 | L5 变现层 | lead_id / from_node / product / amount / status |
| 财务收支 | L5 + L6 | date / type / amount / category / source |

## 已知问题

- [ ] **generate-nodes.js 缺 41 个节点映射**（#167 待修）
- [ ] **generate-nodes.js 输出模板是 5/11 旧版**（不含 TLDR / fade-section）
- [ ] **3 个 Python 脚本硬编码 `NODES_DIR = /Users/opc-1/Downloads/O/opcone/nodes`**，要支持 VPS 路径需改为 `os.environ['NODES_DIR']` 或 argparse

## 相关文档

- `ONE-MCN-G0-CHECKLIST.md` — 飞书 5 表顶部要放的 g0 手动检查清单
- `ONE-MCN-AGENT-MATRIX.md` — 16 个 Agent 配置（含规格阶段标识）
- `../docs/redesign-projects/ma-design-rules.md` — 节点 layout 设计规则
