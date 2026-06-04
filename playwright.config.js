/**
 * Playwright 全局配置
 *
 * 运行: npx playwright test
 * 仅运行某个文件: npx playwright test tests/e2e.spec.js
 * UI 模式: npx playwright test --ui
 * 调试: npx playwright test --debug
 *
 * 服务启动: bash start.sh (端口 3000)
 *   或: npx http-server . -p 3000 -c-1 --cors
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.js$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],

  // 本地开发时不自动启动（避免端口冲突）
  // CI 环境通过 start.sh 启动后直接跑测试
  webServer: process.env.CI ? {
    command: 'bash start.sh',
    url: 'http://localhost:3000',
    timeout: 30_000,
    reuseExistingServer: false
  } : undefined
});
