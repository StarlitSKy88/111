#!/usr/bin/env node
//
// ONE-MCN node CTA attribution injection script
//
// 1. Scan nodes/*/index.html
// 2. Convert existing wechat links to /go/wechat?from=node-XX
// 3. Inject a unified bottom CTA block before footer-nav
// 4. Dry-run by default, --apply to actually write
//
// Usage:
//   node scripts/add-cta-utm.js           # dry-run
//   node scripts/add-cta-utm.js --apply   # write
//
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const NODES_DIR = path.join(__dirname, '..', 'nodes');
const APPLY = process.argv.includes('--apply');

// CTA 注入的 HTML（注入到 footer-nav 之前）
const CTA_BLOCK = `
    <aside class="cta-block" data-cta-type="wechat" aria-label="加入社群">
      <div class="cta-eyebrow">节点 {NODE_ID} · 私信小助手</div>
      <h3 class="cta-title">看完还在卡？<br>加微信 1v1 答疑</h3>
      <p class="cta-desc">群里只聊 OPC 实操：节点卡点 / 工具推荐 / 同行接龙。广告勿扰。</p>
      <a href="/go/wechat?from=node-{NODE_ID}&amp;utm_source=node&amp;utm_medium=cta&amp;utm_campaign=footer"
         class="cta-link"
         data-cta="wechat-footer"
         rel="noopener">
        <span class="cta-arrow">→</span>
        <span>扫码 / 长按识别 加好友</span>
      </a>
      <p class="cta-meta">归因标识：node-{NODE_ID} · 通过服务器记录</p>
    </aside>
`;

// CTA CSS（注入到 <head> 末尾）
const CTA_CSS = `
<style id="cta-injected">
  .cta-block {
    max-width: 720px;
    margin: var(--space-3xl, 96px) auto var(--space-xl, 48px);
    padding: var(--space-xl, 48px) var(--space-lg, 32px);
    border-top: 1px solid var(--line, #2A2A28);
    border-bottom: 1px solid var(--line, #2A2A28);
    text-align: left;
  }
  .cta-eyebrow {
    font-family: 'Geist Mono', 'SF Mono', monospace;
    font-size: 0.6875rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text-tertiary, #7A7670);
    margin-bottom: var(--space-md, 24px);
  }
  .cta-title {
    font-family: 'Noto Serif JP', 'Noto Serif SC', serif;
    font-size: clamp(1.5rem, 3.5vw, 2.25rem);
    font-weight: 300;
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--text-primary, #F0EDE6);
    margin: 0 0 var(--space-md, 24px);
  }
  .cta-desc {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--text-secondary, #B8B4AE);
    max-width: 50ch;
    margin: 0 0 var(--space-lg, 32px);
  }
  .cta-link {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9375rem;
    letter-spacing: 0.04em;
    color: var(--text-primary, #F0EDE6);
    border-bottom: 1px solid var(--accent, #C0392B);
    padding-bottom: 0.375rem;
    text-decoration: none;
    transition: opacity 300ms ease;
  }
  .cta-link:hover { opacity: 0.6; }
  .cta-arrow { font-family: 'Noto Serif JP', serif; font-size: 1.1rem; }
  .cta-meta {
    margin-top: var(--space-md, 24px);
    font-family: 'Geist Mono', monospace;
    font-size: 0.6875rem;
    letter-spacing: 0.15em;
    color: var(--text-quaternary, #4A4744);
  }
</style>
`;

let processed = 0;
let alreadyHasCta = 0;
let errors = [];

const nodeDirs = fs.readdirSync(NODES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

for (const nodeDir of nodeDirs) {
  const indexPath = path.join(NODES_DIR, nodeDir, 'index.html');
  if (!fs.existsSync(indexPath)) continue;

  const html = fs.readFileSync(indexPath, 'utf-8');
  const $ = cheerio.load(html);

  // 1. 提取节点 ID（从目录名 "01-opc-fit-test" → 1）
  const idMatch = nodeDir.match(/^(\d+)/);
  if (!idMatch) {
    errors.push(`${nodeDir}: 目录名无法解析节点 ID`);
    continue;
  }
  const nodeId = idMatch[1];

  let changed = false;

  // 2. 把现有 "weixin://" / "wechat-pay" / "加微信" 链接加 UTM
  $('a[href*="weixin"], a[href*="wechat"], a[href*="加微信"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    if (href.startsWith('/go/wechat')) return;  // 已处理
    $el.attr('href', `/go/wechat?from=node-${nodeId}&original=${encodeURIComponent(href)}`);
    $el.attr('data-cta-original', href);
    changed = true;
  });

  // 3. 检查是否已有 cta-block（避免重复注入）
  if ($('.cta-block').length > 0) {
    alreadyHasCta++;
    continue;
  }

  // 4. 注入 CTA CSS（如果还没有）
  if (!$('#cta-injected').length) {
    $('head').append(CTA_CSS);
    changed = true;
  }

  // 5. 注入 CTA 区块（在 footer-nav 前）
  const ctaHtml = CTA_BLOCK.replace(/{NODE_ID}/g, nodeId);
  const footerNav = $('nav.footer-nav').first();
  if (footerNav.length) {
    footerNav.before(ctaHtml);
    changed = true;
  } else {
    // 没 footer-nav 的话，注入到 </main> 前
    $('main').append(ctaHtml);
    changed = true;
  }

  if (changed) {
    if (APPLY) {
      fs.writeFileSync(indexPath, $.html(), 'utf-8');
    }
    processed++;
  }
}

console.log('='.repeat(60));
console.log(`CTA 归因注入 ${APPLY ? '(APPLIED)' : '(DRY-RUN)'}`);
console.log('='.repeat(60));
console.log(`扫描节点:   ${nodeDirs.length}`);
console.log(`处理节点:   ${processed}`);
console.log(`已有 CTA:   ${alreadyHasCta}`);
console.log(`错误:       ${errors.length}`);
if (errors.length) errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
if (!APPLY && processed > 0) {
  console.log();
  console.log('💡 预览完成。跑 `node scripts/add-cta-utm.js --apply` 真正写入。');
}
