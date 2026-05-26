# opcone / core

OPC ONE（taomyst.top）— 58个节点的 OPC 创业百科全书，含自测题 + 节点文章。

## 导航
- `mem:opcone/tech_stack` — 技术栈（纯原生 HTML/CSS/JS）
- `mem:opcone/conventions` — 设计系统与代码约定
- `mem:opcone/structure` — 目录结构与节点组织

## 关键信息
- 自测题加载自 `questions.json`
- 58个节点位于 `/nodes/<XX>-slug/index.html`
- 所有节点共享同一模板结构（固定侧边栏 TOC + 固定顶部导航）
- 设计系统：Ma (間) Design System，暗色墨色主题
- API_BASE：localhost:3001（开发）/ window.origin（生产）
- 认证：localStorage 存储 token/username