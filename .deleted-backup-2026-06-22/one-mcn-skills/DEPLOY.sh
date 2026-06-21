#!/usr/bin/env bash
# ONE-MCN 一键部署脚本 v2.0.3
# 蕾姆为 ONE-MCN 设计 · 2026-06-04
#
# 适配：Ubuntu 22.04+ / Debian 12+ / macOS 14+
# 前置：hermes-agent 0.15.1+ 已安装
#
# 功能：
#   1. 验证 16 个 ONE-MCN Skill
#   2. 创建 16 个 cron 任务（A1-A7 / B1-B3 / C1-C4 / D1 / G0）
#   3. 飞书部署完成通知
#   4. 准备 M1 启动（D1 = 2026-07-03）
#
# 用法（在 VPS 上执行）：
#   1. 从 Mac 推送 Skill：
#      rsync -avz /Users/opc-1/Downloads/O/opcone/one-mcn-skills/ ubuntu@43.160.213.118:~/.hermes/skills/one-mcn/
#   2. 在 VPS 跑：
#      bash ~/.hermes/skills/one-mcn/DEPLOY.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo "${BLUE}║         ONE-MCN 一键部署 v2.0.3 · 蕾姆 for 昴君       ║${NC}"
echo "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. 环境检查
echo "${YELLOW}▸ 步骤 1/4: 环境检查${NC}"
if ! command -v hermes &> /dev/null; then
  echo "${RED}✗ hermes 命令未找到${NC}"
  echo "  请先安装：python3 -m venv ~/hermes-venv && ~/hermes-venv/bin/pip install hermes-agent"
  exit 1
fi
HERMES_VERSION=$(hermes --version 2>&1 | head -1)
echo "${GREEN}✓ hermes 版本: $HERMES_VERSION${NC}"

if [ ! -d "$HOME/.hermes" ]; then
  echo "${RED}✗ ~/.hermes 目录不存在${NC}"
  exit 1
fi
echo "${GREEN}✓ ~/.hermes 目录存在${NC}"

# 2. 创建 skill 目录（如未创建）
echo ""
echo "${YELLOW}▸ 步骤 2/4: 注册 16 个 Skill${NC}"
mkdir -p ~/.hermes/skills/one-mcn
SKILL_COUNT=$(find ~/.hermes/skills/one-mcn -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
echo "  当前已注册 Skill: $SKILL_COUNT / 16"

if [ "$SKILL_COUNT" -lt 16 ]; then
  echo "${RED}✗ Skill 文件不全（$SKILL_COUNT < 16）${NC}"
  echo "  请先从 Mac 推 SKILL.md 过来："
  echo "    rsync -avz /Users/opc-1/Downloads/O/opcone/one-mcn-skills/ ubuntu@43.160.213.118:~/.hermes/skills/one-mcn/"
  exit 1
fi
echo "${GREEN}✓ 16 个 Skill 文件就位${NC}"

# 验证 hermes 能识别
for skill_dir in ~/.hermes/skills/one-mcn/*/; do
  skill_name=$(basename "$skill_dir")
  if [ -f "$skill_dir/SKILL.md" ]; then
    echo "  ✓ $skill_name"
  else
    echo "  ✗ $skill_name (无 SKILL.md)"
  fi
done

# 3. 创建 16 个 cron 任务
echo ""
echo "${YELLOW}▸ 步骤 3/4: 创建 16 个 cron 任务${NC}"

# 备份现有 cron
if [ -f ~/.hermes/cron/cron.json ]; then
  cp ~/.hermes/cron/cron.json ~/.hermes/cron/cron.json.bak-$(date +%Y%m%d-%H%M%S)
  echo "  备份现有 cron: ~/.hermes/cron/cron.json.bak-$(date +%Y%m%d-%H%M%S)"
fi

# 16 个 cron 的真实 Hermes 命令（hermes cron create）
declare -A CRONS=(
  # A 链：内容生产（7 个）
  ["A1"]="0 */6 * * *|A1 赛道扫描|0 6,12,18 * * *|a1-scan"
  ["A2"]="0 8 * * *|A2 爆款拆解|a2-decompose"
  ["A3"]="0 9 * * *|A3 反向需求|a3-reverse"
  ["A4"]="0 10 * * *|A4 脚本生成|a4-script"
  ["A5"]="30 10 * * *|A5 红线审查|a5-redline"
  ["A6"]="0 11 * * *|A6 配图封面|a6-cover"
  ["A7"]="30 11 * * *|A7 TTS 配音|a7-tts"
  # B 链：发布 + 数据（4 个）
  ["B1"]="30 14 * * *|B1 智能发布|b1-publish"
  ["B2"]="0 16,18,20,22 * * *|B2 数据采集|b2-data"
  ["B3-Daily"]="0 6 * * *|B3 每日日报|b3-report"
  ["B3-Weekly"]="0 22 * * 0|B3 周报|b3-report"
  # C 链：私域（4 个 M2 stub）
  ["C1"]="0 9 * * *|C1 私域客服|c1-service"
  ["C2"]="0 10 * * *|C2 朋友圈|c2-moments"
  ["C3"]="0 23 * * *|C3 漏斗日报|c3-tags"
  ["C4"]="0 22 * * *|C4 裂变日报|c4-fission"
  # 守护：G0 + D1
  ["G0"]="30 23 * * *|G0 早期熔断|g0-guard"
  ["D1"]="*/5 * * * *|D1 SOP 自检|d1-sop"
)

CREATED=0
SKIPPED=0
for key in A1 A2 A3 A4 A5 A6 A7 B1 B2 B3-Daily B3-Weekly C1 C2 C3 C4 G0 D1; do
  entry="${CRONS[$key]}"
  IFS='|' read -r schedule name skill_name <<< "$entry"

  # 检查是否已存在
  if hermes cron list 2>/dev/null | grep -q "$name"; then
    echo "  ⊙ $name 已存在，跳过"
    SKIPPED=$((SKIPPED+1))
  else
    echo "  + $name ($schedule) - $skill_name"
    PROMPT="$name · 详见 ~/.hermes/skills/one-mcn/$skill_name/SKILL.md"
    hermes cron create "$schedule" "$PROMPT" \
      --name "$name" \
      --skill "$skill_name" \
      --deliver local,feishu 2>&1 | head -1
    CREATED=$((CREATED+1))
  fi
done

echo "${GREEN}✓ 新建 $CREATED 个，跳过 $SKIPPED 个${NC}"

# 4. 验证
echo ""
echo "${YELLOW}▸ 步骤 4/4: 验证部署${NC}"
TOTAL_CRON=$(hermes cron list 2>/dev/null | wc -l | tr -d ' ')
echo "  当前 cron 任务总数: $TOTAL_CRON"

# 5. 发送部署完成通知
echo ""
echo "${YELLOW}▸ 通知飞书${NC}"
if [ -f ~/.hermes/config.yaml ]; then
  FEISHU_WEBHOOK=$(grep "feishu_webhook:" ~/.hermes/config.yaml | awk '{print $2}' | tr -d '"')
  if [ -n "$FEISHU_WEBHOOK" ]; then
    curl -s -X POST "$FEISHU_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d "{\"msg_type\":\"interactive\",\"card\":{\"elements\":[{\"tag\":\"div\",\"text\":{\"tag\":\"lark_md\",\"content\":\"✅ **ONE-MCN 部署完成 v2.0.3** · 2026-06-04\n- 新建 cron: $CREATED 个\n- 跳过 cron: $SKIPPED 个\n- Skill: 16 个\n- 下一步：M1 启动 2026-07-03\"}}]}}" \
      > /dev/null 2>&1
    echo "${GREEN}✓ 飞书通知已发送${NC}"
  else
    echo "${YELLOW}⚠ 飞书 webhook 未配置，跳过通知${NC}"
  fi
fi

echo ""
echo "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo "${GREEN}║         ✅ 部署完成 · 准备 M1 启动                    ║${NC}"
echo "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📋 后续操作："
echo "  1. 配置 ~/.hermes/config.yaml 中的飞书 webhook / 微信凭证"
echo "  2. 注册视频号 / 抖音 / 小红书 / B站创作者账号"
echo "  3. 申请豆包 / 阿里云 TTS API key"
echo "  4. 安装 HermesPet.app（Mac 端 ⌘⇧H 唤起桌面 Pin）"
echo "  5. 2026-07-03 M1 D1 启动：a1-scan 第一波扫描"
echo ""
echo "💙 蕾姆的话：装备已就位，就等昴君吹响号角了。"
