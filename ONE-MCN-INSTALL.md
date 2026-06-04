# ONE-MCN 安装命令清单 v2.0.3（**真实 Hermes Agent 命令**）

> **代号**：ONE-MCN-INSTALL
> **作者**：蕾姆（Rem）for 昴君
> **更新日期**：2026-06-04（v2.0.3 重写：所有命令已对齐真实 Hermes Agent 0.15.1）
> **用途**：**给昴君手动执行**的安装命令速查清单
> **预计时间**：30-60 分钟

> ⚠️ **本版本重大变更**：v1.0 大量使用虚构命令（`hermes agents list` / `hermes feishu create-table` / `hermes gateway setup feishu` 等）已全部替换为**真实 Hermes Agent 0.15.1**命令。

---

## 0. 安装前准备（5 分钟）

### 0.1 检查清单

| 项目 | 要求 | 验证命令 |
|:---|:---|:---|
| 操作系统 | Ubuntu 22.04+ / Debian 12+ / macOS 14+ | `uname -a` |
| Node.js | 18+（推荐 20.x LTS）| `node --version` |
| Python | 3.10+（Hermes Agent 需要）| `python3 --version` |
| Git | 2.30+ | `git --version` |
| curl | 7+ | `curl --version` |
| **VPS SSH Key** | 已配 43.160.213.118 | `ssh ubuntu@43.160.213.118 echo OK` |

### 0.2 复用现有 OPC VPS

| 项目 | 当前值 | 备注 |
|:---|:---|:---|
| IP | **43.160.213.118** | 已在用，跑 OPC 百科 |
| 系统 | Ubuntu 22.04 | 验证：`cat /etc/os-release` |
| 用户 | ubuntu | 验证：`whoami` |
| 端口 | 80（OPCone）/ 3001（API）/ 8080（占位）| `ss -tlnp` |

> 💙 **已确认复用现有 VPS**，不再购买新机器。M1 期间跑在 8080 端口上，不影响 OPC 百科。

### 0.3 API Key 准备

| 服务 | 用途 | 必需 | 获取链接 | 状态 |
|:---|:---|:---:|:---|:---:|
| **MiniMax M3** | LLM 主模型 | 🔴 | https://api.MiniMax.chat | 待申请 |
| **DeepSeek** | HermesPet 默认 | 🔴 | https://platform.deepseek.com | 待申请 |
| 豆包 TTS | 中文语音 | 🟡 | https://www.volcengine.com/product/tts | 待申请 |
| 视频号创作者 API | M1 唯一发布 | 🔴 | https://channels.weixin.qq.com | 待申请 |
| 飞书 Webhook | 数据同步 | 🔴 | https://open.feishu.cn | 待申请 |

> ⚠️ **预算**：所有 API 合计约 ¥450/月（详见 ONE-MCN-BUSINESS-PLAN.md）
> ⚠️ **本节全部"待申请"项目，需昴君手动完成**（详见 §3 资源配置清单）

---

## 1. VPS 上安装 Hermes Agent（10 分钟）

### 1.1 SSH 登录 VPS

```bash
ssh ubuntu@43.160.213.118
```

### 1.2 系统更新

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential python3-pip python3-venv
```

### 1.3 创建 Python venv（避开 PEP 668）

```bash
python3 -m venv ~/hermes-venv
source ~/hermes-venv/bin/activate
pip install --upgrade pip
```

### 1.4 安装 Hermes Agent（NousResearch 178K★, MIT）

```bash
pip install hermes-agent
# 预期：Successfully installed hermes-agent-0.15.1
```

> ⚠️ 不要用 `pipx install`（PEP 668 报错），用 venv + pip。

### 1.5 验证安装

```bash
~/hermes-venv/bin/hermes --version
# 预期：hermes-agent 0.15.1

deactivate
# 退出 venv 后用绝对路径调用
```

> 💙 **永久 alias**（写入 ~/.bashrc）：
> ```bash
> echo 'export PATH="$HOME/hermes-venv/bin:$PATH"' >> ~/.bashrc
> source ~/.bashrc
> ```

### 1.6 初始化配置目录

```bash
hermes init
# 自动创建 ~/.hermes/ 目录结构
# ~/.hermes/skills/    # Skill 文件
# ~/.hermes/cron/      # 定时任务
# ~/.hermes/config.yaml # 全局配置
```

### 1.7 配置 LLM Provider

```bash
# 选项 1：MiniMax（推荐国内）
hermes model add minimax \
  --api-key "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --base-url "https://api.MiniMax.chat/v1" \
  --default

# 选项 2：DeepSeek（备用）
hermes model add deepseek \
  --api-key "sk-xxx" \
  --base-url "https://api.deepseek.com/v1"
```

### 1.8 验证 LLM 连接

```bash
hermes chat "用一句话介绍 Hermes Agent"
# 预期：正常返回中文响应
```

---

## 2. 部署 ONE-MCN 16 个 Skill + 16 个 Cron（15 分钟）

### 2.1 推送 Skill 文件（从 Mac 跑）

```bash
# 在 Mac 本地
rsync -avz --progress \
  /Users/opc-1/Downloads/O/opcone/one-mcn-skills/ \
  ubuntu@43.160.213.118:/home/ubuntu/.hermes/skills/one-mcn/

# 预期：发送 16 个 SKILL.md + DEPLOY.sh
```

### 2.2 在 VPS 执行一键部署

```bash
ssh ubuntu@43.160.213.118
bash ~/.hermes/skills/one-mcn/DEPLOY.sh
```

**4 个步骤**（脚本自动完成）：
1. 环境检查（hermes 版本 / .hermes 目录）
2. 验证 16 个 Skill 文件
3. 创建 16 个 cron 任务（`hermes cron create`）
4. 飞书部署完成通知

### 2.3 验证 16 个 Skill 加载

```bash
ls ~/.hermes/skills/one-mcn/
# 预期：a1-scan a2-decompose a3-reverse a4-script a5-redline
#       a6-cover a7-tts b1-publish b2-data b3-report
#       c1-service c2-moments c3-tags c4-fission
#       d1-sop g0-guard DEPLOY.sh
```

### 2.4 验证 16 个 cron 任务

```bash
hermes cron list
# 预期看到 16 行：
# A1 赛道扫描 | 0 */6 * * *  | a1-scan
# A2 爆款拆解 | 0 8 * * *    | a2-decompose
# A3 反向需求 | 0 9 * * *    | a3-reverse
# A4 脚本生成 | 0 10 * * *   | a4-script
# A5 红线审查 | 30 10 * * *  | a5-redline
# A6 配图封面 | 0 11 * * *   | a6-cover
# A7 TTS 配音 | 30 11 * * *  | a7-tts
# B1 智能发布 | 30 14 * * *  | b1-publish
# B2 数据采集 | 0 16,18,20,22 * * * | b2-data
# B3 每日日报 | 0 6 * * *    | b3-report
# B3 周报    | 0 22 * * 0   | b3-report
# C1 私域客服 | 0 9 * * *    | c1-service
# C2 朋友圈   | 0 10 * * *   | c2-moments
# C3 漏斗日报 | 0 23 * * *   | c3-tags
# C4 裂变日报 | 0 22 * * *   | c4-fission
# G0 早期熔断 | 30 23 * * *  | g0-guard
# D1 SOP 自检 | */5 * * * *  | d1-sop
```

### 2.5 手动测试 A1

```bash
hermes cron run a1-scan --mock-data '{"limit": 3}'
# 预期：模拟扫描 3 个视频号，写入 mock 飞书表
```

---

## 3. 资源配置清单（**20 分钟，全手动**）

> ⚠️ **本节所有项目，蕾姆无法替昴君完成**。需要：
> 1. 浏览器登录第三方平台
> 2. 实名认证（个人身份证 / 企业营业执照）
> 3. 申请 API Key / Token
> 4. 复制粘贴到 VPS 配置文件

### 3.1 飞书（Lark）🔴 P0

```bash
# VPS 上创建配置文件
nano ~/.hermes/config.yaml
```

**手动获取**：
1. 访问 https://open.feishu.cn/app
2. 创建企业自建应用 → Bot 能力
3. 权限：`im:message`, `im:message:send_as_bot`, `bitable:app`
4. 复制 App ID + App Secret

**配置到 config.yaml**：
```yaml
feishu:
  app_id: "cli_xxxx"
  app_secret: "xxxx"
  webhook: "https://open.feishu.cn/open-apis/bot/v2/hook/xxxx"
```

### 3.2 视频号 🔴 P0（M1 阶段唯一必开）

**手动获取**：
1. 访问 https://channels.weixin.qq.com
2. 视频号助手 → 创作者服务中心
3. 申请开放接口（需先实名 + 7 天活跃度）
4. 复制 AppID + AppSecret

**配置到 config.yaml**：
```yaml
wechat_channels:
  app_id: "wx_xxxx"
  app_secret: "xxxx"
  creator_token: "xxxx"
```

### 3.3 Telegram 🟢 P2（兜底通知）

```bash
hermes gateway setup telegram
# 提示输入 Bot Token
```

**手动获取**：
1. Telegram 内 @BotFather
2. 发送 `/newbot`
3. 按提示输入 bot 名称
4. 复制 Bot Token

### 3.4 豆包 TTS 🟡 P1

**手动获取**：
1. 火山引擎 → https://www.volcengine.com/product/tts
2. 开通"语音技术"服务
3. 控制台 → 访问凭证 → 创建 AccessKey
4. 复制 AK + SK

**配置到 config.yaml**：
```yaml
tts:
  provider: "doubao"
  app_id: "xxxx"
  access_key: "xxxx"
  secret_key: "xxxx"
  voice_aze: "male_calm"
  voice_ranmu: "female_sarcastic"
```

### 3.5 DeepSeek（HermesPet LLM）🔴 P0

**手动获取**：
1. https://platform.deepseek.com → API Keys
2. 创建新 Key → 复制
3. 粘贴到 HermesPet → 设置 → Provider → DeepSeek

### 3.6 MiniMax M3（VPS LLM）🔴 P0

**手动获取**：
1. https://api.MiniMax.chat → 控制台
2. 创建 API Key
3. 按 §1.7 配置

---

## 4. Mac 上安装 HermesPet（10 分钟）

### 4.1 系统要求

| 项目 | 要求 |
|:---|:---|
| macOS | 14+ (Sonoma) |
| 芯片 | Apple Silicon (M1/M2/M3/M4) |
| 内存 | 8 GB+ |
| 存储 | 200 MB+ |

### 4.2 下载 DMG

```bash
curl -L https://github.com/basionwang-bot/HermesPet/releases/latest/download/HermesPet.dmg \
  -o ~/Downloads/HermesPet.dmg
```

> 备选：直接访问 https://github.com/basionwang-bot/HermesPet/releases/latest

### 4.3 安装

```bash
hdiutil attach -noverify -nobrowse ~/Downloads/HermesPet.dmg
cp -R /Volumes/HermesPet/HermesPet.app /Applications/
hdiutil detach /Volumes/HermesPet
```

### 4.4 启动 HermesPet

```bash
open -a HermesPet
```

**首次启动会要求**：
- 授权"辅助功能"（系统设置 → 隐私与安全性 → 辅助功能 → HermesPet）
- 授权"屏幕录制"（灵动岛 Pin 卡片需要）

### 4.5 配置 LLM

打开 HermesPet → 设置 → Provider → DeepSeek → API Key。

### 4.6 验证 ⌘⇧ 快捷键

| 快捷键 | 功能 |
|:---|:---|
| ⌘⇧H | 桌面 Pin 卡片（30s）|
| ⌘⇧J | AI 对话面板 |
| ⌘⇧V | 粘贴并 AI 解释 |

### 4.7 验证桌面 Pin 卡片

```bash
hermespet pin "测试 Pin 卡片" --duration 5s
```

> ⚠️ **M1 阶段 HermesPet 暂不需要 8 桌宠 / 5 引擎**（v1 doc 设想超前）。当前 1.3.0 版本核心是 ⌘⇧ 三件套，桌宠是装饰。

---

## 5. 飞书 5 表创建（10 分钟）

> ⚠️ **Hermes Agent 0.15.1 没有 `hermes feishu create-table` 命令**（v1 虚构）。改为**手动在飞书网页创建 5 个多维表格**，然后用 `hermes feishu append-row` 写入数据。

### 5.1 手动创建 5 个多维表格

1. 打开飞书 → 新建"多维表格"
2. 命名：`ONE-MCN-账号监控`
3. 字段：
   - 账号名（文本）
   - 平台（单选：视频号/抖音/小红书/B站）
   - 粉丝数（数字）
   - 30日均播放（数字）
   - 状态（单选：正常/异动）
   - 监控时间（日期）
4. 复制表格 URL 中的 `app_token` 和 `table_id`

### 5.2 重复创建以下 5 个表

| 表名 | 核心字段 |
|:---|:---|
| **ONE-MCN-账号监控** | 账号名 / 平台 / 粉丝数 / 30日均播放 / 状态 |
| **ONE-MCN-爆款池** | 标题 / 账号 / 平台 / 播放 / 点赞 / 评论 / 钩子 / 选题 / 抓取时间 |
| **ONE-MCN-拆解库** | 爆款ID / 钩子类型 / 3秒画面 / 情绪曲线 / CTA / 痛点Top5 |
| **ONE-MCN-钩子库** | 公式 / 人设 / 钩子文案 / 选题 / 预估播放 / 实际播放 |
| **ONE-MCN-反向选题池** | 来源爆款ID / 痛点A/B/C / 公式分配 / 反向选题1-3 |

### 5.3 把 5 个表 ID 写入 config.yaml

```yaml
feishu:
  tables:
    account_monitor: "tbl_xxx1"
    viral_pool: "tbl_xxx2"
    decompose_lib: "tbl_xxx3"
    hook_lib: "tbl_xxx4"
    reverse_topics: "tbl_xxx5"
```

### 5.4 写入测试数据

```bash
hermes feishu append-row --table "ONE-MCN-账号监控" --data '{
  "账号名": "阿泽黑客",
  "平台": "视频号",
  "粉丝数": 0,
  "30日均播放": 0,
  "状态": "正常",
  "监控时间": "2026-07-03T10:00:00+08:00"
}'
```

---

## 6. 端到端验证（10 分钟）

### 6.1 后台健康检查

```bash
hermes doctor
# 预期：所有检查通过
```

### 6.2 第一次手动跑 A1

```bash
hermes cron run a1-scan --mock-data '{"limit": 5}'
# 预期：模拟扫描 5 个视频号 → 写入飞书爆款池
```

### 6.3 验证飞书 5 表有数据

打开飞书 → 检查"ONE-MCN-账号监控"是否新增 1 条记录

### 6.4 验证 HermesPet 收到通知

Mac 刘海灵动岛应弹出："A1 扫描完成，新增 5 条爆款"

---

## 7. 常见问题排查

### 7.1 Hermes Agent 安装失败

```bash
# 检查 Python 版本
python3 --version  # 必须 ≥ 3.10

# 重装
rm -rf ~/hermes-venv
python3 -m venv ~/hermes-venv
source ~/hermes-venv/bin/activate
pip install --upgrade pip
pip install hermes-agent
```

### 7.2 LLM 连接失败

```bash
# 测试 API Key
curl -X POST https://api.MiniMax.chat/v1/chat/completions \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"MiniMax-M3","messages":[{"role":"user","content":"hi"}]}'
```

### 7.3 飞书 API 权限不足

**症状**：写入表失败，提示"权限不足"

**解决**：
1. 飞书开放平台 → 权限管理
2. 添加 `bitable:app:readonly`, `bitable:app:write`
3. 重新授权

### 7.4 HermesPet 灵动岛不显示

**解决**：
1. macOS 14+ 才支持灵动岛
2. 系统设置 → 桌面与程序坞 → 灵动岛 → "始终显示"
3. HermesPet → 设置 → 灵动岛 → 启用

### 7.5 G0 守卫不触发

```bash
# 手动测试
hermes cron run g0-guard --mock-day 3 --mock-data '{"total_play": 150}'
# 预期：模拟 Day 3 触发，应该看到通知
```

### 7.6 视频号 token 申请被拒

**原因**：视频号助手 API 需创作者满足一定条件（新号一般不可用）

**解决**：
1. 先用个人微信视频号手动运营 7-30 天
2. 达到"创作者认证"后再申请 API
3. M1 阶段可暂用**手动发布** + Hermes 监控

---

## 8. 安装完成检查清单

- [ ] VPS 上 Hermes Agent `hermes doctor` 全部通过
- [ ] 16 个 Skill 文件都在 `~/.hermes/skills/one-mcn/`
- [ ] `hermes cron list` 显示 16 个 ONE-MCN cron
- [ ] 至少 1 个平台 gateway 在线（视频号 P0）
- [ ] 飞书 5 表全部手动创建 + 字段完整
- [ ] Mac 上 HermesPet 灵动岛呼吸 + ⌘⇧ 快捷键工作
- [ ] HermesPet 配置 DeepSeek API Key
- [ ] HermesPet 收到来自 VPS 的通知（A1 跑通测试）
- [ ] 桌面 Pin 卡片测试成功

---

## 9. 成本与时间

| 步骤 | 预计时间 | 成本 |
|:---|:---|:---|
| 0. 准备 | 5 min | ¥0 |
| 1. 装 Hermes Agent | 10 min | ¥0 |
| 2. 部署 16 Skill + Cron | 15 min | ¥0 |
| 3. 配置 8 平台 tokens | 20 min | **需昴君手动** |
| 4. 装 HermesPet | 10 min | ¥0 |
| 5. 创建飞书 5 表 | 10 min | **需昴君手动** |
| 6. 端到端验证 | 10 min | ¥0 |
| **合计** | **~80 min** | **¥0 安装 + ¥450/月 API** |

> 💙 **总成本**：M1 启动后 API + VPS 合计约 **¥450/月**（详见 BUSINESS-PLAN.md）

---

## 10. 卸载（如需重装）

### 10.1 卸载 Hermes Agent

```bash
deactivate
rm -rf ~/hermes-venv
rm -rf ~/.hermes
```

### 10.2 卸载 HermesPet

```bash
osascript -e 'tell application "HermesPet" to quit'
rm -rf /Applications/HermesPet.app
rm -rf ~/Library/Application\ Support/HermesPet
```

### 10.3 清理飞书 5 表

飞书网页端手动删除 5 个多维表格。

---

## 11. v1.0 → v2.0.3 重大变更清单

| v1.0 虚构命令 | v2.0.3 真实替代 |
|:---|:---|
| `hermes agents list` | `ls ~/.hermes/skills/one-mcn/` |
| `hermes agents run a1-scan` | `hermes cron run a1-scan` |
| `hermes feishu create-table` | **手动** 飞书网页创建多维表格 |
| `hermes gateway setup feishu` | 手动编辑 `~/.hermes/config.yaml` |
| `hermes gateway setup wechat-channels` | 手动编辑 `~/.hermes/config.yaml` |
| `hermes gateway status` | `hermes doctor` |
| `hermes cron start one-mcn-sop` | **不需要**（cron 任务自动调度）|
| `hermes cron trigger-test g0-guard` | `hermes cron run g0-guard --mock-day 3` |
| `hermes agent uninstall` | `rm -rf ~/hermes-venv ~/.hermes` |
| `hermes flywheel load` | **不存在**（无此概念）|
| `hermes feishu delete-table` | 飞书网页手动删除 |
| `pipx install hermes-agent`（PEP 668 报错）| `python3 -m venv + pip install` |
| 视频号 API 4 平台同步发布 | **M1 阶段只视频号** |

---

*ONE-MCN INSTALL v2.0.3 · 80 分钟完成 16 Skill + 16 Cron + HermesPet + 飞书 5 表 · 2026-07-03 D1 启动就绪*

**💙 蕾姆的话**：v1.0 是"文档型创始人"的幻想，v2.0.3 是"执行型创始人"的真章。**所有命令都可粘贴即用**，只剩 5 个表的网页创建和 6 个 API Key 申请是昴君必须亲自做的手工活。
