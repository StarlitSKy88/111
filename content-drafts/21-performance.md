---
node_id: 21
persona: neutral
cta_type: course
keywords: [工具, 优化, 数据, 指标, 的时间]
---

# 节点21：性能基础优化

> **面向OPC**：产品能用了，Bug也修了，但用户说"有点慢"。一个人怎么做性能优化，不花一分钱，不做过度工程？

---

## 一、先测后优：2026年最省事的性能测试

### 三个免费工具，覆盖所有场景

| 工具 | 测什么 | 获取方式 |
|---|---|---|
| **Lighthouse** | 综合评分（性能/可访问性/SEO） | Chrome DevTools → Lighthouse标签 |
| **PageSpeed Insights** | 真实用户数据+优化建议 | [pagespeed.web.dev](https://pagespeed.web.dev) |
| **Web Vitals 扩展** | 实时监控LCP/INP/CLS | Chrome网上应用店搜"Web Vitals" |

### 只看三个指标

| 指标 | 全称 | 含义 | 及格线 | 优秀线 |
|---|---|---|---|---|
| **LCP** | Largest Contentful Paint | 页面"看起来加载完"的时间 | ≤2.5秒 | ≤1.5秒 |
| **INP** | Interaction to Next Paint | 点按钮到页面反应的时间 | ≤200ms | ≤100ms |
| **CLS** | Cumulative Layout Shift | 页面跳动的程度 | ≤0.1 | ≤0.05 |

**OPC只看LCP**：对大部分产品来说，LCP≤2.5秒 = 用户感觉"不慢"。INP和CLS是加分项。

---

## 二、OPC的前端性能三板斧（今天就能做）

### 第一斧：图片优化（影响最大，最简单）

```html
<!-- ❌ 之前：一张2MB的PNG -->
<img src="hero.png" alt="产品截图">

<!-- ✅ 现在：WebP格式 + 指定宽高 + 懒加载 -->
<img src="hero.webp" width="800" height="400" loading="lazy" decoding="async" alt="产品截图">
```

**工具**：[Squoosh](https://squoosh.app/) 在线无损转换图片。1分钟把2MB的PNG变成200KB的WebP。

### 第二斧：不用的大文件别加载

```html
<!-- ❌ 全套Tailwind CDN（300KB+） -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- ✅ 只用你实际需要的CSS，或者用Tailwind CLI按需生成（30KB） -->
npx tailwindcss -i input.css -o output.css --minify
```

**OPC数据**：加载时间减少1秒 = 转化率提高2%（Google 2026年最新研究）。

### 第三斧：首屏不需要的，晚点加载

```javascript
// 核心功能1的代码 → 直接加载
import { mainFeature } from './core.js';

// 核心功能2的代码 → 用户点了再加载
button.addEventListener('click', async () => {
  const { secondaryFeature } = await import('./feature2.js');
  secondaryFeature();
});
```

---

## 三、后端性能：OPC最容易忽略的慢

### Supabase查询慢的三种常见原因

| 问题 | 现象 | 解决 |
|---|---|---|
| **缺索引** | 数据多了查询变慢 | `CREATE INDEX idx_user_id ON orders(user_id);` |
| **N+1查询** | 循环里查数据库 | 用Supabase的`select('*, users(*)')`做联表查询 |
| **全表扫描** | 每次都查所有数据 | 前端请求带`.limit(20)`，不要一次取所有行 |

### 一个SQL命令自查

```sql
-- 查看哪些查询最慢（Supabase Dashboard → SQL Editor）
SELECT query, calls, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## 四、不需要做的优化（省时间清单）

| 你以为需要 | 实际上不需要 | 省下时间 |
|---|---|---|
| CDN加速 | Vercel/Netlify自带全球CDN | 0天 |
| 代码压缩混淆 | 构建工具自动做了 | 0天 |
| 服务端渲染(SSR) | 静态页面CDN已经够快 | 省3天 |
| Redis缓存 | Supabase自带的查询缓存够用 | 省2天 |
| 数据库读写分离 | 日活1万以下根本不需要 | 省5天 |

---

## 五、检查清单

- [ ] Lighthouse评分≥90
- [ ] 首页LCP≤2.5秒（PageSpeed实测）
- [ ] 所有图片已转WebP格式
- [ ] 大文件CDN引用而非整包引入
- [ ] 数据库查询已检查慢查询
- [ ] 无未加索引的高频查询字段

---

## 节点资源链接

- 节点20：Bug集中修复
- 节点22：上线内容填充
- 节点25：网站部署与SSL
