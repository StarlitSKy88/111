tell application "Terminal"
    activate
    do script "cd ~/Downloads/O/opcone && echo '📊 OPC内容生成监控已启动 - 每10秒刷新' && watch -n 10 'for d in pending_reviews/*/; do echo \"$(basename \"$d\"): $(wc -c < \"$d/content.md\" 2>/dev/null) bytes\"; done'"
end tell
