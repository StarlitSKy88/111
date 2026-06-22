/**
 * ONE-MCN Web · Root Layout
 * v5.4 japanese-ma-minimalism（間）
 * 字体：Shippori Mincho（标题/明朝）+ Noto Sans JP（UI/哥特）
 */
import './globals.css';
import type { Metadata } from 'next';
import { Shippori_Mincho, Noto_Sans_JP } from 'next/font/google';

const shipporiMincho = Shippori_Mincho({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-shippori-mincho',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ONE-MCN · 一人品牌',
  description: '间 — 一人公司的 AI 助手',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${shipporiMincho.variable} ${notoSansJP.variable}`}
    >
      <body className="antialiased font-gothic bg-ink-bg text-ink-primary">
        <div className="washi-texture" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}