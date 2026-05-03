#!/bin/bash
# 一键启动Hackathon演示环境

echo "🚀 启动OPC适配自测演示..."

# 检查.env文件
if [ ! -f api/.env ]; then
  echo "⚠️  api/.env 不存在，复制模板..."
  cp api/.env.example api/.env
  echo "请编辑 api/.env 填入 OPENAI_API_KEY"
fi

# 启动API服务（后台）
echo "📡 启动API服务..."
cd api && node analyze.js &
API_PID=$!
cd ..

# 启动HTTP服务
echo "🌐 启动HTTP服务..."
npx http-server . -p 3000 -c-1 --cors &
HTTP_PID=$!

echo ""
echo "✅ 服务已启动！"
echo "📱 访问: http://localhost:3000"
echo "🔧 API: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "kill $API_PID $HTTP_PID 2>/dev/null; exit" INT TERM
wait