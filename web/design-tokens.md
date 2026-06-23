# ONE-MCN Design System v5.4

> **集成源**：aurora-skill（暗色品牌）+ stitch-skill（反通用 UI 标准）
> **目标**：Linear/Vercel 级 AI SaaS 美学
> **状态**：v5.4 active

---

## 1. 旋钮配置（stitch-skill）

| 旋钮 | 级别 | 描述 |
|:---|:---:|:---|
| **创意度** | `8` | 高创意（不是极简单调）|
| **密度** | `4` | 均衡区段，不拥挤 |
| **差异性** | `8` | 高差异（防对称性无聊）|
| **动效意图** | `6` | 流畅但不过分戏剧化 |

---

## 2. 极光调色板（aurora-skill）

### 2.1 基础表面（暗色优先 + 亮色兼容）

| 角色 | 暗色 | 亮色 | 用途 |
|:---|:---|:---|:---|
| **虚空背景** | `#030712` | `#faf7f2` | 主背景 |
| **表面 1（卡片）** | `#0F1117` | `#FFFFFF` | 卡片容器 |
| **表面 2（提升层）** | `#161B27` | `#F9FAFB` | 弹窗/抽屉 |
| **发丝边框** | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` | 卡片边框 1px |
| **悬停边框** | `rgba(255,255,255,0.14)` | `rgba(0,0,0,0.16)` | hover 状态 |
| **主文字** | `#F5F5F5` | `#18181B` | Zinc-50 / Zinc-950 |
| **次要文字** | `#A1A1AA` | `#71717A` | Zinc-400 / Zinc-500 |
| **三级文字** | `#71717A` | `#94A3B8` | 时间戳/禁用 |

### 2.2 极光色彩池（去饱和、自然）

| 极光色 | HEX | 用途 |
|:---|:---|:---|
| **极光青绿** | `#0D9488` / `#14B8A6` | 主品牌色（替代原 #ff5a1f 朱红）|
| **北极紫罗兰** | `#6366F1` / `#818CF8` | 次要强调 |
| **冰川蓝** | `#0EA5E9` / `#38BDF8` | 信息提示 |
| **警示橙** | `#F59E0B` | 警告状态 |
| **危险红** | `#EF4444` | 错误/删除 |

### 2.3 立即禁止

- ❌ 紫色+蓝色渐变按钮
- ❌ 过饱和发光环
- ❌ "AI 初创公司"霓虹边框
- ❌ 彩虹纸屑背景
- ❌ 圆角药丸按钮（border-radius: 0 或 max 4px）

---

## 3. 排版（aurora + stitch）

| 字体 | 用途 | 字号 |
|:---|:---|:---|
| `Inter` | UI 文字（已默认）| 14px / 16px / 18px |
| `JetBrains Mono` | 代码 / 数字 | 12px / 14px |
| `Inter Display` | Hero 大标题 | clamp(48px, 10vw, 96px) |

---

## 4. 间距（8px 倍数）

```css
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 48px;
--space-2xl: 64px;
--space-3xl: 96px;
--space-4xl: 128px;
```

---

## 5. 动效（动效意图 6）

- 时长：最少 400ms，偏好 600ms-800ms
- 缓动：`cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- 入场：仅 `opacity-0 translateY(20px)` → `opacity-1 translateY(0)`
- 悬停：仅 `transition-opacity duration-300`

---

## 6. 实施映射（Tailwind 配置）

```js
// tailwind.config.ts
colors: {
  // aurora 主品牌
  brand: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    500: '#14b8a6', // 极光青绿（替代朱红）
    600: '#0d9488',
    700: '#0f766e',
  },
  surface: {
    1: '#0F1117',
    2: '#161B27',
  },
},
backgroundColor: {
  void: '#030712',
}
```

---

## 7. v5.4 落地清单

- ✅ Phase 1: aurora tokens 集成（本文档 §2）
- ✅ Phase 2: stitch 旋钮配置（本文档 §1）
- 🔵 Phase 3: Landing 重写（aurora 暗色 + stitch 反通用 UI）
- 🔵 Phase 4: Dashboard 重写（aurora + data-viz 仪表板）
- 🔵 Phase 5: ARCHITECTURE 配图（diagram-design 13 种技术图）

详见 web/app/ + web/design-tokens.md