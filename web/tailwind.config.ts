import type { Config } from 'tailwindcss';

/**
 * ONE-MCN · v5.4 japanese-ma-minimalism（間）
 * 暖墨色基底 + Shippori Mincho（标题）+ Noto Sans JP（UI）
 * 8px 倍数间距 · ≥32px 起 · 极简动效 ≤300ms
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Ma palette — 仅墨色暗色（亮色禁用）
      colors: {
        // 墨色基底 5 阶
        ink: {
          bg: '#111110',       // 暖近黑（墨汁）
          surface: '#1A1A18',  // 表面
          line: '#2A2825',     // 1px 结构线
          tertiary: '#3A3835', // 弱化
          secondary: '#7A7670',// 褪色墨（次文字）
          primary: '#F0EDE6',  // 老化纸张（主文字）
        },
        // 朱红强调（每页最多 1 个元素）
        vermilion: {
          DEFAULT: '#E05A47',
          dim: '#A03A2A',
        },
        // 和纸色（仅作 surface 别名）
        washi: '#1A1A18',
      },
      // CJK 优先字体对
      fontFamily: {
        mincho: [
          'var(--font-shippori-mincho)',
          'Shippori Mincho',
          'Noto Serif JP',
          'serif',
        ],
        gothic: [
          'var(--font-noto-sans-jp)',
          'Noto Sans JP',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      // 8px 倍数间距 · ≥32px 起（侘寂余白）
      spacing: {
        0: '0',
        1: '4px',
        2: '8px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
        24: '96px',
        32: '128px',
        48: '192px',
        64: '256px',
      },
      // 字号 — 标题克制度
      fontSize: {
        hero: [
          'clamp(3.5rem, 9vw, 9rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        display: [
          'clamp(2.5rem, 5vw, 4rem)',
          { lineHeight: '1.15', letterSpacing: '-0.01em' },
        ],
        title: [
          'clamp(1.5rem, 3vw, 2rem)',
          { lineHeight: '1.3' },
        ],
        body: ['1rem', { lineHeight: '1.8' }],
        small: ['0.875rem', { lineHeight: '1.7' }],
        caption: ['0.75rem', { lineHeight: '1.6', letterSpacing: '0.05em' }],
      },
      // 极简动效（≤300ms 透明度过渡）
      transitionDuration: {
        '0': '0ms',
        '150': '150ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-ma': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // 不再需要 fade-in / slide-up 动画（侘寂主张"静"）
      // 保留 keyframes 以防其他包引用
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      maxWidth: {
        prose: '58ch',
        '2xl-tight': '42rem',
        '3xl-tight': '52rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;