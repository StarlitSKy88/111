/**
 * ONE-MCN Badge · v5.4 japanese-ma-minimalism（間）
 * 方形标签 · 无药丸 · font-mono 等宽小字
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-mono transition-colors',
  {
    variants: {
      variant: {
        default:
          'border border-ink-line text-ink-primary bg-transparent',
        outline: 'border border-ink-line text-ink-secondary bg-transparent',
        vermilion:
          'border border-vermilion text-vermilion bg-transparent',
        subtle: 'text-ink-secondary bg-transparent',
      },
    },
    defaultVariants: { variant: 'outline' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };