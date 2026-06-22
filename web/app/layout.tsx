/**
 * ONE-MCN Web · Root Layout
 * v5.2 Next.js 14 App Router
 */
import './globals.css';

export const metadata = {
  title: 'ONE-MCN · 60 天用 AI 跑通你的 1 人品牌',
  description: '被裁了？35 岁？60 天用 AI 跑通你的 1 人 MCN 品牌',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}