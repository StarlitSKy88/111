/**
 * ONE-MCN Web · Root Layout
 * v5.4.5 — 系统字体栈（沙箱网络无法访问 Google Fonts）
 */
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ONE-MCN · 一人品牌',
  description: '間 — 一人公司的 AI 助手',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-gothic">
        <div className="washi-texture" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}