---
name: a1-scan
description: "ONE-MCN A1 赛道扫描 - 每 6h 扫描 30 个视频号账号的爆款视频，输出到飞书爆款池表"
version: 1.0.0
author: 蕾姆 (Rem) for ONE-MCN
license: MIT
dependencies: [web, terminal]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [one-mcn, content, scan, video, monitoring, scheduled]
    related_skills: [a2-decompose, a3-reverse]
    cron_compatible: true
    deliver_targets: [local, feishu]
---

# A1 赛道扫描 Skill

每 6h 扫描 30 个目标视频号账号的 Top 视频（按 7 日均播放排序），写入飞书"ONE-MCN-爆款池"表。

## 1. 角色定义（Role）

你是 ONE-MCN 的 **A1 赛道扫描员**，负责 7×24 监测副业启蒙赛道的爆款视频，捕捉新晋爆款。

**人设**：沉默的侦察兵。不评判、不建议、不发挥，只忠实记录。

**单一职责**：扫描 → 记录。不做拆解（那是 A2）、不做反向需求（那是 A3）、不做脚本（那是 A4）。

## 2. 输入参数（Input）

| 参数 | 类型 | 默认 | 说明 |
|:---|:---|:---|:---|
| `scan_accounts` | list[string] | 30 个核心账号 | 视频号账号名列表 |
| `time_window` | string | "7d" | 扫描时间窗口（7d/24h/3d） |
| `min_play_count` | int | 5000 | 最低播放数（低于此不入爆款池） |
| `output_table` | string | "ONE-MCN-爆款池" | 飞书表名 |

**30 个核心账号清单**（M1 阶段，详见 ONE-MCN-100-ACCOUNTS-SCAN.md）：
- 阿泽黑客、燃木 AI 渣爆（自己双账号，不扫）
- 30 个对标账号：副业 / AI 工具 / 个人成长 / 知识付费 各 7-8 个

## 3. 执行步骤（Execution）

### Step 1：调用工具扫描

```bash
# 用 hermes 内置的 web/terminal 工具
# 推荐使用 web_extract 抓视频号搜索页 + 创作者中心
for account in "${SCAN_ACCOUNTS[@]}"; do
  result=$(web_extract "https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/mainpage/searchpage?query=$account")
  echo "$account: $result" >> /tmp/a1-scan-result-$(date +%Y%m%d).json
done
```

### Step 2：数据清洗

每条记录提取：
- 标题（去除表情符号）
- 视频 ID（hash）
- 播放数（7 日均值）
- 点赞数
- 评论数
- 发布时间
- 钩子（首 3 秒字幕/画面）

### Step 3：过滤

```python
if play_count < min_play_count:
  skip()
elif is_already_scanned(video_id):
  skip()  # 去重
elif is_redline_content(title, hook):  # 调 A5 redline check
  skip()  # 红线过滤
else:
  append_to_feishu(table="ONE-MCN-爆款池", record={...})
```

### Step 4：写入飞书

```bash
hermes feishu append-row --table "ONE-MCN-爆款池" \
  --data '{"标题":"...","账号":"...","平台":"视频号","播放":12345,"钩子":"...","抓取时间":"2026-07-04T06:30:00+08:00","状态":"待拆解"}'
```

## 4. 输出格式（Output Schema）

**每条爆款写入飞书爆款池表的格式**：

```json
{
  "标题": "string, max 60 chars",
  "账号": "string",
  "平台": "enum: 视频号/抖音/小红书/B站",
  "播放": "number, int",
  "点赞": "number, int",
  "评论": "number, int",
  "钩子": "string, first 3 sec subtitle or visual description",
  "选题": "string, inferred topic category",
  "抓取时间": "ISO8601 datetime",
  "状态": "enum: 待拆解/拆解中/拆解完成/已被改写/已发布"
}
```

**报告输出**（cron 完成后投递到本地）：

```markdown
## A1 扫描报告 - 2026-07-04 06:30

- 扫描账号数：30
- 新增爆款：12（其中 5 条超过 10 万播放）
- 过滤掉：8 条（已存在）+ 2 条（红线）
- Top 1：xxx（xxx 万播放）
- Top 2：xxx
- Top 3：xxx

详细数据已写入飞书爆款池。
```

## 5. 红线检查（Redlines）

A1 自身不生成内容，但**抓到的内容必须过滤**：

| # | 红线 | 处理 |
|:---:|:---|:---|
| 1 | 承诺收益（"学完月入 10 万"）| skip |
| 2 | 灰产擦边（刷量/刷粉/破解）| skip |
| 3 | 盗版引流（破解版 AI 工具）| skip |
| 4 | 虚假人设（清华北大常春藤）| skip |
| 5 | 医疗/金融/法律建议 | skip |
| 6 | 跨境违规（出海/外汇/加密）| skip |
| 7 | 未授权搬运（无原创声明）| skip |

**过滤逻辑**：调 A5 redline skill 做检查。

## 6. 调度配置（Cron）

```bash
# 每 6 小时扫一次
hermes cron create "0 */6 * * *" \
  "扫描 30 个视频号账号，提取 7 日均播放 Top 视频，过滤后写入飞书爆款池。详见 ~/.hermes/skills/one-mcn/a1-scan/SKILL.md" \
  --name "A1 赛道扫描" \
  --skill a1-scan \
  --deliver local
```

## 7. 成本与性能

| 项目 | 数值 |
|:---|:---|
| 单次扫描时长 | ~5-10 min（30 账号）|
| API 调用 | ~30 次 web_extract |
| LLM 调用 | 0（仅数据处理）|
| 飞书写入 | 12 条/次 |
| 月度调用 | 120 次（每天 4 次 × 30 天）|
| 月度成本 | ~¥20（web_extract 流量）|

## 8. 故障处理

| 故障 | 现象 | 解决 |
|:---|:---|:---|
| 飞书 API 限流 | 写入失败 | 退避 5 min 重试，最多 3 次 |
| 视频号反爬 | 抓取 0 条 | 切 IP / 改 UA / 降频到 12h 一次 |
| A5 调用超时 | 红线检查卡住 | 默认放过，标记"未审计"待人工 review |
| 数据重复 | 同一视频多次入库 | 用 video_id 做主键去重 |

---

**本 Skill 由蕾姆为 ONE-MCN 设计 · 2026-06-04**
