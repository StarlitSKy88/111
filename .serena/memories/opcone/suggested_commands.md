# opcone / suggested_commands

## 开发
- 直接打开 `index.html` 或节点页面在浏览器预览
- Tailwind CDN 和 Google Fonts 在线加载，无需构建

## 节点统计
```bash
ls /Users/opc-1/Downloads/O/opcone/nodes/ | wc -l  # 节点数量
grep -l 'ppt\|PPT' /Users/opc-1/Downloads/O/opcone/nodes/*/index.html  # 含PPT关键词
```

## 项目规模
- 58个节点 HTML 文件
- 2个主要入口（index.html + nodes/*/index.html）