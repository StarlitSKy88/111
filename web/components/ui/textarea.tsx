/**
 * ONE-MCN Textarea · v5.4 japanese-ma-minimalism（間）
 * 方形 · 1px hairline · 墨色表面
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[96px] w-full bg-ink-surface border border-ink-line px-4 py-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-ink-secondary disabled:opacity-50 transition-colors duration-300',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };