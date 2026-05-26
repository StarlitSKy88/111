# opcone / conventions

## Ma Design System
基于日本「間」哲学的 wabi-sabi 风格设计系统。

## 配色（CSS 变量）
```
--bg: #111110
--surface: #1A1A18
--text-primary: #F0EDE6
--text-secondary: #A09A94
--text-tertiary: #6A6560
--accent: #C0392B
--accent-dark: #a33025
--line: #2A2A28
```

## 排版
- 字体：Noto Sans SC（正文）、Noto Serif JP（标题）
- 字重：200（display）/ 300（headline）/ 400（body）
- 字间距：0.03em–0.2em

## CSS 类
`.text-display` / `.text-headline` / `.text-body` / `.text-label`
`.ma-layout` / `.ma-center` / `.ma-sidebar` / `.section-gap`

## 布局
- 移动优先响应式，clamp() 流式字体
- 节点页：两栏 grid（220px sidebar + 1fr content）