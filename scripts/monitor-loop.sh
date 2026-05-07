#!/bin/bash
# OPC内容生成监控器 - 替代watch命令
# 用法: ./monitor-loop.sh

cd ~/Downloads/O/opcone

echo "📊 OPC内容生成监控已启动 - 每10秒刷新"
echo "按 Ctrl+C 退出"
echo ""

while true; do
    clear
    echo "=============================================="
    echo "📊 OPC内容生成 实时监控 $(date '+%H:%M:%S')"
    echo "=============================================="
    echo ""

    count=0
    for d in pending_reviews/*/; do
        if [ -d "$d" ]; then
            name=$(basename "$d")
            size=$(wc -c < "$d/content.md" 2>/dev/null || echo 0)
            size_kb=$(echo "scale=1; $size/1024" | bc 2>/dev/null || echo "$((size/1024))")
            printf "   ✅ %-30s %6s KB\n" "$name" "$size_kb"
            count=$((count + 1))
        fi
    done

    echo ""
    echo "📈 进度: $count/40 ($(echo "scale=1; $count*100/40" | bc 2>/dev/null || echo "0"))%"
    echo ""
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S') | Ctrl+C 退出"
    sleep 10
done
