#!/bin/bash
# OPC内容生成详细监控器 - 循环版（替代watch）
# 每10秒刷新，显示进程状态、API错误、生成进度

GEN_TASK_ID="bdvnqc4dp"
LOG_DIR="/private/tmp/claude-501/-Users-opc-1-Downloads-O-opcone/ca905310-68e0-41dd-8085-9afec867cc35/tasks"

cd ~/Downloads/O/opcone

echo "📊 OPC内容生成详细监控已启动 - 每10秒刷新"
echo "按 Ctrl+C 退出监控"
echo ""

while true; do
    clear
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  📊 OPC内容生成 实时详细监控  $(date '+%H:%M:%S')      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    # === 进程状态 ===
    GEN_PID=$(pgrep -f "ai-content-generator.js" 2>/dev/null | head -1)
    if [ -n "$GEN_PID" ]; then
        echo "🟢 Generator进程运行中 (PID: $GEN_PID)"
    else
        echo "🔴 Generator进程未运行!"
        echo "   ⚠️  内容生成可能已中断或完成"
    fi

    # === 最新日志 ===
    LOG_FILE="$LOG_DIR/${GEN_TASK_ID}.output"
    if [ -f "$LOG_FILE" ]; then
        echo ""
        echo "--- 📜 Generator最新输出 (最后8行) ---"
        tail -8 "$LOG_FILE" 2>/dev/null | sed 's/^/   /' || echo "   (无法读取日志)"
    fi

    # === 已生成节点 ===
    echo ""
    echo "--- 📁 已生成节点 ---"
    count=0
    total_size=0
    for d in pending_reviews/*/; do
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
    echo "📈 进度: $count/40 ($(echo "scale=1; $count*100/40" | bc 2>/dev/null || echo "0")%)"
    echo "💾 总大小: $(echo "scale=1; $total_size/1024/1024" | bc 2>/dev/null || echo "$((total_size/1024/1024))") MB"

    # === 错误检查 ===
    if [ -f "$LOG_FILE" ]; then
        echo ""
        echo "--- ⚠️  错误检查 ---"
        errors=$(grep -c "ERROR\|失败\|timeout\|429\|socket hang up\|JSON parse" "$LOG_FILE" 2>/dev/null || echo "0")
        if [ "$errors" -gt 0 ]; then
            echo "⚠️  发现 $errors 个错误/警告:"
            grep "ERROR\|失败\|timeout\|429\|socket hang up\|JSON parse" "$LOG_FILE" 2>/dev/null | tail -3 | sed 's/^/   /'
        else
            echo "✅ 无API错误"
        fi
    fi

    # === 预估剩余时间 ===
    if [ "$count" -gt 0 ]; then
        avg_time=$(echo "scale=1; ($(date +%s) - $(stat -f %B "$LOG_FILE" 2>/dev/null || echo $(date +%s)))/$count" | bc 2>/dev/null || echo "0")
        remaining=$((40 - count))
        eta_min=$(echo "scale=0; $remaining * $avg_time / 60" | bc 2>/dev/null || echo "?")
        echo ""
        echo "⏱️  预估剩余时间: 约 ${eta_min} 分钟 (基于当前速度)"
    fi

    echo ""
    echo "╰─────────────────────────────────────────────────────────"
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S') | Ctrl+C 退出"
    sleep 10
done
