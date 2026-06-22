#!/bin/bash
# ONE-MCN PostgreSQL 启动脚本（蕾姆 Task #4 准备）
# 2026-06-22
# 用法：bash .harness/PG-STARTUP-SCRIPT.sh

set -euo pipefail

echo "================================================================"
echo " ONE-MCN PostgreSQL 16 启动脚本（v5.3）"
echo "================================================================"

# Step 1: 检查 Docker / brew
if ! command -v docker &> /dev/null; then
  echo "❌ Docker 未安装"
  echo "   brew install --cask docker"
  exit 1
fi

# Step 2: 检查端口 54322
if lsof -i :54322 &> /dev/null; then
  echo "⚠️  端口 54322 已被占用"
  lsof -i :54322
  exit 1
fi

# Step 3: 启动 PG 16 容器
echo "▶ Step 3: 启动 PostgreSQL 16 容器..."
docker run -d --name one-mcn-pg \
  -p 54322:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=one_mcn_test \
  -e POSTGRES_USER=postgres \
  -v one-mcn-pg-data:/var/lib/postgresql/data \
  postgres:16

# Step 4: 等待 PG 启动
echo "▶ Step 4: 等待 PostgreSQL 就绪..."
for i in {1..30}; do
  if docker exec one-mcn-pg pg_isready -U postgres -d one_mcn_test &> /dev/null; then
    echo "✅ PostgreSQL 已就绪（用时 ${i}s）"
    break
  fi
  sleep 1
done

# Step 5: 创建 test_restore 库（D0-17）
echo "▶ Step 5: 创建 test_restore 库（D0-17 备份恢复测试）..."
docker exec one-mcn-pg psql -U postgres -c "CREATE DATABASE test_restore;" 2>&1 | head -3

# Step 6: 输出 DATABASE_URL
echo ""
echo "================================================================"
echo " ✅ PostgreSQL 启动成功"
echo "================================================================"
echo ""
echo "请把以下 export 加入 ~/.zshrc 或当前 shell："
echo ""
echo '  export DATABASE_URL="postgres://postgres:postgres@localhost:54322/one_mcn_test"'
echo '  export NODE_ENV="development"'
echo '  export PORT="3000"'
echo ""
echo "然后重启 Express server:"
echo ""
echo "  pkill -f 'tsx watch src/server.ts'  # 杀掉旧的"
echo "  pnpm dev                             # 重新启动"
echo ""
echo "验证命令："
echo ""
echo "  curl localhost:3000/api/health"
echo "  # 期望：{\"status\":\"ok\",\"database\":{\"connected\":true}}"
echo ""
echo "跑 L-W-INFRA-01 migration："
echo ""
echo "  pnpm db:migrate"
echo "  # 验证：psql \$DATABASE_URL -c '\\dt' | wc -l 应 >= 8"
echo ""
echo "================================================================"
echo " 下一步：获取 Stripe / 微信 / 支付宝 test keys"
echo "================================================================"
echo ""
echo "📌 Stripe test key（5 分钟）："
echo "   1. 访问 https://dashboard.stripe.com/test/apikeys"
echo "   2. 复制 'Publishable key' 和 'Secret key'（以 sk_test_ 开头）"
echo "   3. 写入 .env："
echo "        STRIPE_SECRET_KEY=sk_test_..."
echo "        STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "        STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "📌 微信支付 test mchid（30 分钟）："
echo "   1. 微信支付商户平台：https://pay.weixin.qq.com"
echo "   2. 申请测试商户号（需营业执照或个体工商户）"
echo "   3. 写入 .env："
echo "        WECHAT_PAY_MCH_ID=..."
echo "        WECHAT_PAY_API_KEY=..."
echo "        WECHAT_PAY_NOTIFY_URL=https://your-domain/api/webhooks/wechat"
echo ""
echo "📌 支付宝 test key（30 分钟）："
echo "   1. 支付宝开放平台：https://open.alipay.com"
echo "   2. 创建沙箱应用"
echo "   3. 写入 .env："
echo "        ALIPAY_APP_ID=..."
echo "        ALIPAY_PRIVATE_KEY=..."
echo "        ALIPAY_PUBLIC_KEY=..."
echo ""
echo "================================================================"
echo " 所有 keys 配齐后，/goal 跑剩余 loop 即可"
echo "================================================================"