# OPC适配自测 Hackathon

> AI不会淘汰任何人，它只会淘汰所有把自己当工具的人。

## 项目概述

OPC适配自测 + AI分析演示Hackathon项目。通过10道测试题，真AI生成个性化分析报告。

## 核心功能

- ✅ 10道OPC适配测试题
- ✅ 动画分数揭示（从0滚动到最终分数）
- ✅ AI个性化分析报告（DeepSeek V4）
- ✅ 可分享结果卡片生成
- ✅ 个人OPC项目手册AI生成
- ✅ PDF报告导出
- ✅ 视频脚本v2.0
- ✅ 管理后台数据追踪（测试数/付款/微信ID）

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 启动服务（一键启动）
bash start.sh

# 3. 访问
http://localhost:3000
```

## 项目结构

```
opcone/
├── index.html          # 单页落地页
├── app.js              # 前端逻辑
├── questions.json      # 10道测试题
├── api/
│   ├── analyze.js      # AI分析API
│   └── .env.example    # 环境变量模板
├── start.sh            # 一键启动脚本
├── proxy.js            # 本地代理
├── tests/              # 测试文件
├── 内容库/脚本/         # 视频脚本
└── docs/               # 设计文档
```

## 技术栈

- 前端: HTML + Tailwind CDN + Vanilla JS
- 后端: Express.js
- AI: DeepSeek V4 (腾讯TokenHub)
- 预览图生成: html2canvas
- PDF导出: jsPDF

## 环境变量

复制 `api/.env.example` 到 `api/.env`，填入API Key。

---

*做AI的老板，让AI变成你的免费员工。*