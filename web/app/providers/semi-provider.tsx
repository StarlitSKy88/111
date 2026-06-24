/**
 * ONE-MCN Semi Theme Provider
 * v5.5.1 — 修复 Semi 默认蓝色（强制 Ma 暖墨色主题）
 *
 * 关键：必须传完整 theme 对象，不能只设 primaryColor
 * Semi 2.x 默认是亮色主题 + 蓝色 primary，必须全面覆盖
 */
'use client';

import { ConfigProvider } from '@douyinfe/semi-ui';

const MA_THEME = {
  type: 'dark' as const,
  // === 颜色：全面覆盖 Semi 默认（朱红 + 暖墨）===
  primaryColor: '#E05A47',           // 朱红
  primaryColorHover: '#F06A57',
  primaryColorPressed: '#C04A37',
  primaryColorSuppl: '#A03A2A',
  secondaryColor: '#7A7670',
  successColor: '#7A8471',
  warningColor: '#F59E0B',
  dangerColor: '#E05A47',
  errorColor: '#E05A47',
  // 背景层级
  backgroundColor: '#111110',         // ink-bg
  bgColor0: '#0F0F0E',
  bgColor1: '#111110',
  bgColor2: '#1A1A18',              // ink-surface
  bgColor3: '#2A2825',              // ink-line
  bgColor4: '#3A3835',
  bgColor5: '#4A4845',
  bgColor6: '#5A5855',
  bgColor7: '#6A6865',
  bgColor8: '#7A7670',
  bgColor9: '#8A8682',
  // 文字
  textColor: '#F0EDE6',
  textColorPrimary: '#F0EDE6',
  textColorSecondary: '#7A7670',
  textColorTertiary: '#3A3835',
  textColorQuaternary: '#2A2825',
  textColorHint: '#3A3835',
  // 边框
  borderColor: '#2A2825',
  // === 形状：0 圆角（侘寂无药丸）===
  borderRadius: 0,
  borderRadiusSmall: 0,
  borderRadiusMedium: 0,
  borderRadiusLarge: 0,
  borderRadiusExtraLarge: 0,
  borderRadiusCircle: 0,
  // === 字体 ===
  fontFamily:
    '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans JP", system-ui, sans-serif',
  fontFamilyMono:
    'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace',
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
};

export function SemiThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={MA_THEME}
      direction="ltr"
      locale="zh-CN"
      getPopupContainer={(node) => (node?.parentNode as HTMLElement) ?? document.body}
    >
      {children}
    </ConfigProvider>
  );
}