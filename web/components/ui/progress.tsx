/**
 * ONE-MCN Progress · v5.4 japanese-ma-minimalism（間）
 * 1px 细线 · 不是药丸
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('progress-ma', className)}
        {...props}
      >
        <div className="progress-ma-fill" style={{ width: `${value}%` }} />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };