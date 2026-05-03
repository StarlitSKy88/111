# CLAUDE.md

## 项目概述

OPC适配自测 Hackathon项目 — 10道测试题 + 真AI分析报告 + 视频脚本v2.0

## 核心交付物

| 文件 | 说明 |
|:---|:---|
| `questions.json` | 10道OPC适配测试题 |
| `index.html` | 单页落地页 + Tailwind CDN |
| `app.js` | 前端逻辑 |
| `api/analyze.js` | 后端AI分析API |
| `start.sh` | 一键启动脚本 |

## 环境配置

### API配置
- 模型：`deepseek-v4-flash`
- API端点：`https://tokenhub.tencentmaas.com/v1/chat/completions`
- Key：`sk-UX6ezaZKGktnbbino4FJahcQRtYp3yomoZnHOHbdtZ1xh4Vp`

### 启动步骤
1. 填入API Key到 `api/.env`
2. 执行 `bash start.sh`

## 技能路由

| 场景 | 技能 |
|:---|:---|
| 产品构思/头脑风暴 | /office-hours |
| 策略/范围 | /plan-ceo-review |
| 架构 | /plan-eng-review |
| Bug/错误 | /investigate |
| 测试/QA | /qa |
| 代码审查 | /review |

## 模型选择

当前使用 DeepSeek V4 (腾讯TokenHub)