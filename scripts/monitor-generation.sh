#!/bin/bash
# OPC内容生成监控脚本
# 用法: ./monitor-generation.sh

LOG_FILE="/Users/opc-1/Downloads/O/opcone/logs/generation.log"
PID_FILE="/Users/opc-1/Downloads/O/opcone/logs/generation.pid"

mkdir -p "$(dirname "$LOG_FILE")"

echo "📊 OPC内容生成监控器启动 - $(date)"
echo "📊 日志文件: $LOG_FILE"
echo ""

# 如果有新内容生成，立即通知
check_new_content() {
    local count=$(ls -d /Users/opc-1/Downloads/O/opcone/pending_reviews/*/ 2>/dev/null | wc -l)
    echo "[$(date '+%H:%M:%S')] 已生成节点: $count/40"
}

# 监控循环
while true; do
    clear
    echo "=========================================="
    echo "📊 OPC内容生成 实时监控"
    echo "=========================================="
    echo ""

    # 检查进程是否在运行
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "🟢 Generator进程运行中 (PID: $(cat "$PID_FILE"))"
    else
        echo "🔴 Generator进程未运行"
        echo "   启动命令: node api/ai-content-generator.js --mode=initial"
    fi

    echo ""

    # 显示已生成节点
    echo "📁 已生成节点:"
    for d in /Users/opc-1/Downloads/O/opcone/pending_reviews/*/; do
        if [ -d "$d" ]; then
            name=$(basename "$d")
            size=$(wc -c < "$d/content.md" 2>/dev/null || echo 0)
            size_kb=$(echo "scale=1; $size/1024" | bc 2>/dev/null || echo "0")
            echo "   ✅ $name (${size_kb}KB)"
        fi
    done

    count=$(ls -d /Users/opc-1/Downloads/O/opcone/pending_reviews/*/ 2>/dev/null | wc -l | tr -d ' ')
    echo ""
    echo "📈 进度: $count/40 ($(echo "scale=1; $count*100/40" | bc 2>/dev/null || echo "0")%)"

    # 检查最新日志
    if [ -f "$LOG_FILE" ]; then
        echo ""
        echo "📜 最近日志 (最后5行):"
        tail -5 "$LOG_FILE" | sed 's/^/   /'
    fi

    echo ""
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S') | 按Ctrl+C退出监控"
    sleep 30
done
