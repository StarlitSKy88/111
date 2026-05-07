#!/bin/bash
# OPC内容生成详细监控器
# 监控：进程状态 + API状态 + 生成进度 + 错误信息

GEN_PID=$(pgrep -f "ai-content-generator.js" 2>/dev/null | head -1)
LOG_FILE="/private/tmp/claude-501/-Users-opc-1-Downloads-O-opcone/ca905310-68e0-41dd-8085-9afec867cc35/tasks/bdvnqc4dp.output"

echo "📊 OPC内容生成详细监控"
echo "Generator PID: ${GEN_PID:-未运行}"
echo ""

# 检查进程状态
if [ -n "$GEN_PID" ]; then
    echo "🟢 Generator进程运行中 (PID: $GEN_PID)"

    # 检查进程运行时长
    if [ -d "/proc/$GEN_PID" ] || kill -0 "$GEN_PID" 2>/dev/null; then
        start_time=$(ps -o lstart= -p "$GEN_PID" 2>/dev/null | awk '{print $2,$3,$4}')
        echo "   启动时间: ${start_time:-未知}"
    fi
else
    echo "🔴 Generator进程未运行!"
    echo "   请手动启动: node api/ai-content-generator.js --mode=initial"
    echo ""
fi

echo ""
echo "--- 已生成节点 ---"
count=0
total_size=0
for d in /Users/opc-1/Downloads/O/opcone/pending_reviews/*/; do
    if [ -d "$d" ]; then
        name=$(basename "$d")
        size=$(wc -c < "$d/content.md" 2>/dev/null || echo 0)
        total_size=$((total_size + size))
        size_kb=$(echo "scale=1; $size/1024" | bc 2>/dev/null || echo "$((size/1024))")
        printf "   ✅ %-30s %6s KB\n" "$name" "$size_kb"
        count=$((count + 1))
    fi
done
echo ""
echo "📈 进度: $count/40 | 总大小: $(echo "scale=1; $total_size/1024/1024" | bc 2>/dev/null || echo "$((total_size/1024/1024))") MB"

echo ""
echo "--- 最新Generator输出 ---"
if [ -f "$LOG_FILE" ]; then
    echo "$(tail -20 "$LOG_FILE" 2>/dev/null | sed 's/^/   /')"
else
    echo "   (日志文件不存在)"
fi

echo ""
echo "--- 错误检查 ---"
if [ -f "$LOG_FILE" ]; then
    errors=$(grep -c "ERROR\|失败\|timeout\|429\|socket hang up" "$LOG_FILE" 2>/dev/null || echo "0")
    if [ "$errors" -gt 0 ]; then
        echo "⚠️  发现 $errors 个错误:"
        grep "ERROR\|失败\|timeout\|429\|socket hang up" "$LOG_FILE" 2>/dev/null | tail -5 | sed 's/^/   /'
    else
        echo "✅ 无明显错误"
    fi
fi

echo ""
echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
