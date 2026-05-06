# OPC MVP — Harness-Ready 需求文档

> 本文档用于 Harness 全自动部署。机器可读，所有命令均为可执行状态。

## 1. 应用概述

| 字段 | 值 |
|:---|:---|
| **项目名称** | OPC节点百科 MVP |
| **技术栈** | Node.js + Express + Vanilla JS + Tailwind CDN |
| **运行时** | Node.js 18+ |
| **端口** | 3001 |
| **健康检查** | `GET /health` |

## 2. 环境配置

### 2.1 系统依赖

```bash
# Ubuntu/Debian
apt-get update && apt-get install -y nodejs npm

# macOS
brew install node
```

### 2.2 Node.js 版本管理（推荐）

```bash
# 使用 nvm 管理 Node 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## 3. 环境变量配置

### 3.1 必需变量

| 变量名 | 说明 | 示例值 | 来源 |
|:---|:---|:---|:---|
| `API_KEY` | DeepSeek API 密钥 | `sk-UX6ezaZKGktnbbino...` | 腾讯TokenHub |
| `PORT` | 服务端口 | `3001` | 可选，默认3001 |

### 3.2 .env 文件模板

在 `api/` 目录下创建 `.env` 文件：

```bash
# DeepSeek V4 (腾讯TokenHub)
API_KEY=your_api_key_here
PORT=3001
```

### 3.3 获取 API Key

1. 访问 [腾讯TokenHub](https://tokenhub.tencentmaas.com)
2. 注册/登录账户
3. 在控制台获取 API Key
4. 充值余额（建议 ¥10+ 起步）

## 4. 部署步骤

### 4.1 一键部署命令

```bash
# 克隆项目
git clone https://github.com/YOUR_ORG/opcone.git
cd opcone

# 安装依赖
npm install

# 配置环境变量
cp api/.env.example api/.env
# 编辑 api/.env 填入您的 API_KEY

# 启动服务
npm start
```

### 4.2 完整部署脚本

```bash
#!/bin/bash
set -e

# 变量
APP_DIR="/var/www/opcone"
PORT=3001
API_KEY="${API_KEY}"  # 从环境变量或密钥管理器获取

# 1. 创建目录
sudo mkdir -p $APP_DIR
cd $APP_DIR

# 2. 拉取代码
git pull origin main

# 3. 安装依赖
npm install

# 4. 配置环境变量
echo "API_KEY=$API_KEY" > api/.env
echo "PORT=$PORT" >> api/.env

# 5. 重启服务
pm2 restart opcone || pm2 start app.js --name opcone

# 6. 验证
curl -f http://localhost:$PORT/health && echo "Deploy successful"
```

## 5. PM2 进程管理

### 5.1 启动命令

```bash
# 开发环境
npm start

# 生产环境（使用 PM2）
pm2 start app.js --name opcone --interpreter node

# 带环境变量
API_KEY=your_key pm2 start app.js --name opcone
```

### 5.2 PM2 配置 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'opcone',
    script: 'app.js',
    cwd: '/var/www/opcone',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      API_KEY: '${API_KEY}'  // 从环境变量读取
    }
  }]
};
```

### 5.3 PM2 常用命令

```bash
pm2 start ecosystem.config.js --env production
pm2 restart opcone
pm2 logs opcone
pm2 monit
pm2 status
```

## 6. Nginx 反向代理配置

### 6.1 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt-get install nginx

# macOS
brew install nginx
```

### 6.2 Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.3 SSL 配置（ Let's Encrypt）

```bash
sudo certbot --nginx -d your-domain.com
```

## 7. 健康检查

### 7.1 端点

| 端点 | 方法 | 说明 | 预期响应 |
|:---|:---:|:---|:---|
| `/health` | GET | 健康检查 | `{"status":"ok","timestamp":"..."}` |
| `/api/stats` | GET | 统计数据 | `{"total":0,"paid":0}` |

### 7.2 健康检查脚本

```bash
#!/bin/bash
# 检查服务是否响应
if curl -sf http://localhost:3001/health > /dev/null; then
    echo "Service is healthy"
    exit 0
else
    echo "Service is down"
    exit 1
fi
```

## 8. 验证测试

### 8.1 冒烟测试

```bash
# 1. 健康检查
curl http://localhost:3001/health

# 2. 获取统计数据
curl http://localhost:3001/api/stats

# 3. 测试 AI 内容生成
curl -X POST http://localhost:3001/api/generate-node-content \
  -H "Content-Type: application/json" \
  -d '{"node_id":1,"title":"产品定位","summary":"测试摘要"}'
```

### 8.2 自动化验证脚本

```bash
#!/bin/bash
set -e

BASE_URL="${BASE_URL:-http://localhost:3001}"

echo "=== OPC MVP 验证测试 ==="

# Test 1: Health check
echo -n "Test 1: Health check... "
HEALTH=$(curl -sf $BASE_URL/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 2: API stats
echo -n "Test 2: API stats... "
STATS=$(curl -sf $BASE_URL/api/stats)
if echo "$STATS" | grep -q "total"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 3: Node content generation (with API key)
if [ -n "$API_KEY" ]; then
    echo -n "Test 3: AI content generation... "
    CONTENT=$(curl -sf -X POST $BASE_URL/api/generate-node-content \
        -H "Content-Type: application/json" \
        -d '{"node_id":1,"title":"产品定位","summary":"测试"}')
    if echo "$CONTENT" | grep -q "content"; then
        echo "✅ PASS"
    else
        echo "⚠️  SKIP (可能需要API_KEY)"
    fi
fi

echo "=== 验证完成 ==="
```

## 9. 数据存储

### 9.1 数据文件

| 文件 | 路径 | 说明 |
|:---|:---|:---|
| 测试结果 | `data/results.json` | 用户测试结果 |
| 支付记录 | `data/payments.json` | 支付确认记录 |
| 节点数据 | `data/nodes.json` | 21个节点静态数据 |

### 9.2 数据备份

```bash
# 每日备份脚本
CRON_JOB="0 2 * * * tar -czf /backup/opcone-data-$(date +\%Y\%m\%d).tar.gz /path/to/opcone/data"
```

## 10. 日志配置

### 10.1 PM2 日志

```bash
# 查看日志
pm2 logs opcone

# 日志路径
~/.pm2/logs/
```

### 10.2 日志轮转 (logrotate)

```bash
# /etc/logrotate.d/opcone
/var/www/opcone/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

## 11. 安全配置

### 11.1 防火墙 (UFW)

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

### 11.2 环境变量安全

- **不要**将 `.env` 文件提交到 Git
- 使用 `api/.env.example` 作为模板
- 生产环境使用密钥管理器或 Vault

## 12. 故障排查

### 12.1 常见问题

| 问题 | 原因 | 解决方案 |
|:---|:---|:---|
| 服务无法启动 | 端口被占用 | `pm2 stop all; lsof -i :3001` |
| API 返回 500 | API_KEY 未配置 | 检查 `api/.env` 文件 |
| 页面空白 | 前端文件未加载 | 检查静态文件路径 |

### 12.2 调试命令

```bash
# 查看端口占用
lsof -i :3001

# 查看 Node 进程
ps aux | grep node

# 查看 PM2 错误日志
pm2 logs opcone --err

# 重启并查看日志
pm2 restart opcone --verbose
```

## 13. 环境清单

| 环境 | URL | 说明 |
|:---|:---|:---|
| 开发 | `http://localhost:3001` | 本地开发 |
| 预发布 | `https://staging.opc.com` | 上线前测试 |
| 生产 | `https://opc.com` | 正式环境 |

## 14. 部署检查清单

- [ ] 代码已推送到 Git
- [ ] 环境变量已配置 (`API_KEY`)
- [ ] 依赖已安装 (`npm install`)
- [ ] 服务已启动 (`pm2 status`)
- [ ] 健康检查通过 (`/health`)
- [ ] 冒烟测试通过
- [ ] DNS 已配置
- [ ] SSL 证书已安装

---

**文档版本**: 1.0.0
**生成时间**: 2026-05-06
**维护者**: OPC Team
