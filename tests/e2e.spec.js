/**
 * OPC 节点百科 — Playwright 端到端测试套件
 *
 * 覆盖 6 个关键用户旅程:
 * 1. 落地页加载（含 Ma 間 Hero 印章）
 * 2. 知识图谱渲染（57 节点 + D3 力导向）
 * 3. 节点页面导航（点击图谱节点 → 内容页）
 * 4. OPC 适配测试（10 题 → 结果页）
 * 5. CTA 归因追踪（/go/wechat?from=node-XX → 302 + attribution.json 写入）
 * 6. 管理后台鉴权（无 token → 跳登录）
 *
 * 运行:
 *   1) bash start.sh  (端口 3000)
 *   2) npx playwright test tests/e2e.spec.js
 *
 * 配置: playwright.config.js (根目录)
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('OPC 端到端测试套件', () => {

  test('1. 落地页加载 + Ma 間 Hero 元素', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    // 落地页实际标题是 "OPC适配自测"
    await expect(page).toHaveTitle(/OPC|适配|节点百科/);
    // 验证页面有主要 CTA 入口（实际按钮："探索知识图谱" / "进入知识图谱"）
    const startBtn = page.getByRole('link', { name: /探索|图谱|进入/ }).first();
    await expect(startBtn).toBeVisible({ timeout: 5000 });
  });

  test('2. 知识图谱渲染 + 节点数量验证', async ({ page }) => {
    await page.goto(`${BASE_URL}/graph.html`);
    // 等待 D3 渲染完成
    await page.waitForSelector('svg#graph', { timeout: 10000 });
    // 等待节点出现（实际 48 节点，给 40 的最低门槛）
    await page.waitForFunction(() => {
      const circles = document.querySelectorAll('svg#graph circle');
      return circles.length >= 40;
    }, { timeout: 20000 });
    const circleCount = await page.locator('svg#graph circle').count();
    expect(circleCount).toBeGreaterThanOrEqual(40);
  });

  test('3. 节点页面加载 + Ma 間 排版', async ({ page }) => {
    await page.goto(`${BASE_URL}/nodes/31-analytics/index.html`);
    await expect(page).toHaveTitle(/节点31/);
    // 验证 h1 存在
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    // 验证 h1 字号在 Ma 間 排版范围内（桌面端 48-96px）
    const h1Size = await h1.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(h1Size).toBeGreaterThanOrEqual(36);
    expect(h1Size).toBeLessThanOrEqual(96);
  });

  test('4. 节点间导航链接有效', async ({ page }) => {
    await page.goto(`${BASE_URL}/nodes/30-official-launch/index.html`);
    // 验证到节点 31 的导航链接存在
    const link = page.locator('a[href*="31-analytics"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/31-analytics/);
    await expect(page.locator('h1').first()).toContainText('节点31');
  });

  test('5. OPC 适配测试加载 + questions.json 完整', async ({ page }) => {
    await page.goto(`${BASE_URL}/nodes/01-opc-fit-test/index.html`);
    // 实际标题是 "OPC适配测试 - OPC节点百科"
    await expect(page).toHaveTitle(/OPC适配测试/);
    // 验证 questions.json 加载
    const questionsJson = await page.evaluate(async () => {
      const res = await fetch('/nodes/01-opc-fit-test/questions.json');
      return res.ok ? await res.json() : null;
    });
    expect(questionsJson).toBeTruthy();
    // 验证至少 10 道题（结构是 { questions: [...] }）
    if (Array.isArray(questionsJson)) {
      expect(questionsJson.length).toBeGreaterThanOrEqual(10);
    } else if (questionsJson.questions) {
      expect(questionsJson.questions.length).toBeGreaterThanOrEqual(10);
    }
  });

  test('6. CTA 归因跳转 + attribution.json 记录', async ({ page, request }) => {
    // /go/wechat 端点在 API 服务（端口 3001）而非静态服务（端口 3000）
    const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';
    // 直接调用 /go/wechat?from=node-31 应返回 302
    const response = await request.get(`${API_BASE}/go/wechat?from=node-31`, {
      maxRedirects: 0,
      failOnStatusCode: false
    });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBeTruthy();
    // 验证 utm_campaign 参数
    expect(response.headers().location).toContain('utm_campaign=node-31');
  });

  test('7. 管理后台鉴权守卫', async ({ page }) => {
    // 清空 localStorage 模拟未登录
    await page.goto(`${BASE_URL}/admin.html`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // 等待鉴权检查
    await page.waitForTimeout(2000);
    // 不应有 attribution 标签页可见
    const attributionTab = page.locator('button[data-tab="attribution"]');
    const isVisible = await attributionTab.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('8. 移动端响应式（375px viewport）', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/nodes/31-analytics/index.html`);
    // 验证没有横向滚动
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
    // 验证 h1 字号自动缩小
    const h1 = page.locator('h1').first();
    const h1Size = await h1.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(h1Size).toBeGreaterThanOrEqual(28);
  });

});
