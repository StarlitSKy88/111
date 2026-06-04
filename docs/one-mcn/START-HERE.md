# ONE-MCN 飞轮启动手册 (START HERE)

> **版本**：v1.0 · **最后更新**：2026-06-04 · **维护人**：蕾姆
> **目的**：让新成员（或未来的蕾姆）**30 分钟跑通整条链**——从选题到变现
> **适用读者**：运营者 / 内容编辑 / 自动化工程师 / 自己 6 个月后回来看的人

---

## 🎯 ONE-MCN 是什么

**一句话**：1 个人 + 1 套 Agent 矩阵 + 1 套 SOP = 一个人公司 (OPC) 模式的 MCN

**8 层架构**：

```
L0 决策 (人)           ← 昴君每周定方向
L1 引擎 (Hermes Agent) ← VPS 上跑 cron + Skill
L2 数据 (飞书 5 表)    ← 唯一真相源
L3 选品 (3 个 Skill)   ← a1-scan / a2-rate / a3-reverse
L4 内容 (4 个 Skill)   ← b1-publish / b2-write / b3-edit / b4-script
L5 流量 (3 个 Skill)   ← c1-reply / c2-dm / c3-followup
L6 变现 (人工)         ← 1v1 咨询 / 课程分销
L7 复盘 (g0-guard)     ← Day 3/5/7 阈值熔断
```

**核心原则**：
- 绝对纯 OPC：单人可执行，**不雇人 / 不融资**
- 阈值熔断：g0-guard 失败 → 立即停写文档 → 转手动执行
- 数据驱动：所有决策依据飞书 5 表数据，**不靠感觉**

---

## ⚡ 30 分钟快速启动

### 第 1 步：本地环境（5 min）

```bash
# 1.1 确认 Node + Python
node --version   # ≥ 18 (推荐 20 LTS)
python3 --version  # ≥ 3.11

# 1.2 装项目依赖（cheerio 是唯一的运行时依赖）
cd /Users/opc-1/Downloads/O/opcone
npm install cheerio --no-save  # 已经在用

# 1.3 启动本地服务
bash start.sh
# → http://localhost:3000 (前端) + http://localhost:3001 (API)
```

### 第 2 步：内容生成管道（5 min）

```bash
# 2.1 已有 29 个 content-drafts（带 frontmatter）
ls content-drafts/ | head -10

# 2.2 给现有 draft 加 frontmatter（如果还没加）
node scripts/add-persona-metadata.js --apply
# 规则：1-3 节点=azhe, 4-10=ranmu, 11-57=neutral

# 2.3 从 draft 生成节点 HTML
node scripts/generate-nodes.js --apply
# 24/57 节点会生成（剩余 33 缺 draft）

# 2.4 注入 CTA 归因
node scripts/add-cta-utm.js --apply
# 58 节点全部加底部 CTA 块
```

### 第 3 步：飞书 5 表创建（10 min）

```bash
# 3.1 飞书开放平台注册应用
# https://open.feishu.cn/app → 创建企业自建应用
# 申请 scopes: bitable:app:readonly + bitable:app

# 3.2 填 .env
cat api/.env | grep -E "FEISHU_APP|FEISHU_TABLE"
# 期望:
# FEISHU_APP_ID=cli_xxxx
# FEISHU_APP_SECRET=xxxx

# 3.3 创建 5 张表
python3 scripts/create-feishu-bitable.py
# 完成后 .env 自动追加:
# FEISHU_TABLE_IDS={"selection":"bit...","schedule":"bit...",...}
```

### 第 4 步：VPS LiteLLM 桥接（5 min）

```bash
# 4.1 SSH 到 VPS
ssh -i /Users/opc-1/Downloads/miyao/hermes.pem ubuntu@43.160.213.118

# 4.2 填 MiniMax key
nano ~/.hermes/litellm-bridge/.env
# MiniMax_API_KEY=sk-cp-你的key

# 4.3 重启服务
systemctl --user restart litellm-bridge

# 4.4 验证
curl http://localhost:9118/v1/models
# 应返回 5 个模型
```

### 第 5 步：HermesPet 配置（5 min）

```
HermesPet → Settings → Hermes Gateway
  部署方式:  云端 Gateway
  API 地址:  http://43.160.213.118:9118/v1
  API 密钥:  dummy  (任意非空)
  模型:      MiniMax-M3  (大写!)
  [测试连接] → 应见 5 模型
```

---

## 📚 全部交付物清单

### 数据层（D2）

| 文件 | 用途 | 何时更新 |
|:---|:---|:---|
| `data/nodes.json` | **57 节点唯一真相源**（id/slug/title/category）| 节点增删时 |
| `data/users.json` | 注册用户 | 注册时 |
| `data/verify-codes.json` | 邮箱验证码 | 验证码时 |
| `data/attribution.json` | CTA 点击归因 | 用户点 CTA 时 |
| `data/results.json` | OPC 适配测试结果 | 用户测时 |
| `data/payments.json` | 支付记录 | 用户支付时 |

### 脚本层（D3）

| 脚本 | 调用顺序 | 何时跑 |
|:---|:---:|:---|
| `scripts/add-persona-metadata.js` | ① | 新增 draft 时 |
| `scripts/generate-nodes.js` | ② | draft 写完批量生成 HTML |
| `scripts/add-cta-utm.js` | ③ | 新增节点时 |
| `scripts/create-feishu-bitable.py` | ④ | 首次部署飞书时 |
| `scripts/feishu-schemas/5-tables.json` | (前置) | 5 表 schema 定义 |

### 文档层（D4）

| 文档 | 读它能学到什么 |
|:---|:---|
| **本文件** | 30 分钟跑通整条链 |
| `G0-CHECKLIST.md` | M1 启动前 7 天的手动检查清单 |
| `ONE-MCN-AGENT-MATRIX.md` | 16 个 Agent 配置 + 成本表 |
| `scripts/README.md` | 4 个脚本的详细调用说明 |
| `../../CLAUDE.md` | 节点设计规范（Ma 間设计系统）|

### VPS 服务（基础设施）

| 服务 | 端口 | 端点 | 状态 |
|:---|:---:|:---|:---:|
| OPC 前端 | 80 | http://43.160.213.118 | ✅ |
| OPC API | 3001 | http://43.160.213.118:3001 | ⚠️ 需手动放行安全组 |
| LiteLLM 桥接 | 9118 | http://43.160.213.118:9118 | ✅ |
| Hermes Gateway | 8645 | (仅 nous/xai OAuth) | ⚠️ 不推荐 |
| 本地前端 | 3000 | http://localhost:3000 | ✅ |
| 本地 API | 3001 | http://localhost:3001 | ✅ |

---

## 🔄 飞轮调用链（核心 SOP）

### A. 选题到发布（每周一次）

```
1. a1-scan (L3) → 飞书 01·选题库
   Skill: a1-scan 平台: 知乎/小红书/B站
   输入: 关键词"独立开发者"/"OPC"/"一人公司"
   输出: 100+ 候选选题（带链接+点赞数+评论数）

2. a2-rate (L3) → 飞书 01·选题库（评分列更新）
   Skill: a2-rate
   输入: 候选选题
   输出: 评分 0-10 + 优先级（≥7 进下一步）

3. a3-reverse (L3) → 飞书 01·选题库（formula 列填充）
   Skill: a3-reverse 调用 MiniMax-M3
   输入: 高分选题
   输出: 内容公式（钩子/结构/CTA）

4. b1-publish (L4) → 飞书 02·内容排期
   Skill: b1-publish
   输入: 选题 + 公式
   输出: 排期（日期/平台/草稿链接）

5. b2-write (L4) → 02·内容排期 draft_url 列
   Skill: b2-write 调用 MiniMax-M3
   输入: 选题 + 公式 + persona
   输出: 完整草稿（1500-3000 字）

6. b3-edit (L4) → 02·内容排期 final_url 列
   人工: 蕾姆或昴君手动润色
   输出: 终稿

7. b4-script (L4) → 02·内容排期 script_url 列
   如果是视频: 生成视频脚本 + 分镜
```

### B. 流量到变现（每天）

```
8. c1-reply (L5) → 飞书 03·粉丝管理
   Skill: c1-reply 自动回复评论
   输入: 平台 webhook
   输出: 评论回复 + 粉丝 tag 写入

9. c2-dm (L5) → 飞书 03·粉丝管理（加微信）
   Skill: c2-dm
   输入: 高意向评论者
   输出: 私信话术 + 微信二维码

10. c3-followup (L5) → 飞书 04·销售管道
    Skill: c3-followup
    输入: 已加微信粉丝
    输出: 跟进记录 + 标签

11. (L6 人工) → 1v1 咨询 / 课程分销
    人工: 蕾姆或昴君
    输出: 飞书 04·销售管道（amount/status）

12. (L6 财务) → 飞书 05·财务收支
    人工: 每月录入
    输出: 月度报表
```

### C. 复盘熔断（每周日）

```
13. g0-guard (L7) → cron 调度
    检查: Day 3/5/7 阈值
    触发: 任一不达 → 立即冻结所有文档任务
    人工: 复盘 + 调整策略
```

---

## 🎨 关键设计原则

### Ma 間设计系统（节点页面）

| 元素 | 规则 |
|:---|:---|
| 配色 | 暗色 #111110 底 + 朱红 #C0392B 强调（每页 ≤1 处）|
| 字体 | Noto Serif JP 标题 + Noto Sans SC 正文 + Geist Mono 标注 |
| 间距 | 8px 倍数（--space-md: 24 / --space-xl: 48 / --space-3xl: 96）|
| 圆角 | 0 或 ≤2px（绝对不要药丸按钮）|
| 动效 | 600-800ms 缓入缓出，无弹簧无弹跳 |
| 最大宽度 | 1200px（所有节点页统一）|

### 归因规范

所有 CTA 必须带 UTM：
```html
<a href="/go/wechat?from=node-{ID}&utm_source=node&utm_medium=cta&utm_campaign=footer">
```

服务器 `/go/wechat` 302 重定向到真实微信二维码，**同时记录 attribution.json**：
```json
{
  "clicks": [
    { "from": "node-31", "ts": "2026-06-04T13:00:00Z", "ip": "1.2.3.4" }
  ]
}
```

### 阈值熔断

g0-guard 监控 3 个阈值（M1 启动 7 天内）：
- **Day 3**：视频 ≥ 2 / 粉丝 ≥ 10 / 脚本 ≥ 3
- **Day 5**：视频 ≥ 4 / 粉丝 ≥ 30 / 私域 ≥ 20
- **Day 7**：视频 ≥ 6 / 粉丝 ≥ 60 / 私域 ≥ 50 / 销售额 ≥ ¥1000

任一不达 → **立即冻结所有 L4 文档任务** → 转为 L5 手动执行。

---

## 🆘 故障排查

### LiteLLM 桥接 401

```bash
# 1. 检查 key 是否过期
ssh ubuntu@43.160.213.118 'cat ~/.hermes/litellm-bridge/.env'

# 2. 检查 service 状态
ssh ubuntu@43.160.213.118 'systemctl --user status litellm-bridge'

# 3. 重启
ssh ubuntu@43.160.213.118 'systemctl --user restart litellm-bridge'

# 4. 端到端测试
curl -X POST http://43.160.213.118:9118/v1/chat/completions \
  -H "Content-Type: application/json" -H "Authorization: Bearer dummy" \
  -d '{"model":"MiniMax-M3","messages":[{"role":"user","content":"hi"}]}'
```

### generate-nodes.js 没生成某个节点

```bash
# 1. 看具体哪些节点缺 draft
node scripts/generate-nodes.js 2>&1 | grep "Not found"

# 2. 缺哪个就写一个 content-drafts/{id}-{slug}.md
# frontmatter 格式:
# ---
# node_id: 31
# persona: neutral
# cta_type: course
# keywords: [数据, 监控, GA]
# ---

# 3. 重新跑
node scripts/generate-nodes.js --apply
```

### 飞书 API 报 token invalid

```bash
# 1. 检查 .env
cat api/.env | grep FEISHU

# 2. 飞书 token 2 小时过期，create-feishu-bitable.py 内部会自动续
# 如果还是失败，去 https://open.feishu.cn/app 检查 app 状态

# 3. scopes 是否给够: bitable:app:readonly + bitable:app
```

---

## 📈 监控指标

### 每日必看

- `data/attribution.json` → CTA 点击排行 → 调优文案
- 飞书 01·选题库 → 评分 ≥7 的选题数
- 飞书 02·内容排期 → 本周排期完成率

### 每周必看

- 飞书 03·粉丝管理 → 新增粉丝数 + 来源分布
- 飞书 04·销售管道 → 转化漏斗（私信→咨询→付费）
- 飞书 05·财务收支 → 周度营收

### 每月必看

- L7 阈值复盘：g0-guard 7 天趋势
- VPS 服务 uptime（systemctl status）
- 飞书 API 调用配额（默认 10000 次/天，应该够用）

---

## 🔗 相关链接

- **飞书开放平台**：https://open.feishu.cn/app
- **MiniMax 文档**（中国）：https://platform.minimaxi.com/docs/
- **VPS 主机**：43.160.213.118（新加坡三区）
- **Hermes Agent GitHub**：https://github.com/just-every/hermes-agent
- **OPC 节点百科**：http://localhost:3000/

---

## 📝 变更日志

| 日期 | 变更 |
|:---|:---|
| 2026-06-04 | v1.0 蕾姆初始化（基于 #162-#174 + #175 验证）|
| 待补 | 等真实跑 M1 7 天后，把"踩坑"补到故障排查章节 |
