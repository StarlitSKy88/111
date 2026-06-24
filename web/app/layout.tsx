/**
 * ONE-MCN Web · Root Layout
 * v5.5.1 — Semi Theme Provider + Ma 暖墨色 + 系统字体栈
 */
import './globals.css';
import '@douyinfe/semi-ui/lib/es/_base/base.css';
import type { Metadata } from 'next';
import { SemiThemeProvider } from './providers/semi-provider';

export const metadata: Metadata = {
  title: 'ONE-MCN · 一人品牌',
  description: '間 — 一人公司的 AI 助手',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SemiThemeProvider>
          <div className="washi-texture" aria-hidden="true" />
          {children}
        </SemiThemeProvider>
      </body>
    </html>
  );
}