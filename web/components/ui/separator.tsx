/**
 * ONE-MCN Separator · v5.4 japanese-ma-minimalism（間）
 * 1px hairline 分隔线
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  accent?: boolean; // 朱红强调（罕见使用）
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', accent = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn(
          orientation === 'horizontal'
            ? 'h-[1px] w-full'
            : 'w-[1px] h-full',
          accent ? 'bg-vermilion' : 'bg-ink-line',
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = 'Separator';

export { Separator };