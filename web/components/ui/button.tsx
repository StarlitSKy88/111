/**
 * ONE-MCN Button · v5.4 japanese-ma-minimalism（間）
 * 文字 CTA 风格 · 无原色 · 无药丸 · 1px hairline
 */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center gap-3 text-sm tracking-[0.08em] uppercase transition-opacity duration-300 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        link: 'border-b border-current pb-0.5 hover:opacity-60',
        ghost: 'hover:opacity-60',
        outline:
          'border border-ink-line px-8 py-3 hover:bg-ink-surface hover:border-ink-secondary',
        vermilion:
          'text-vermilion border-b border-vermilion pb-0.5 hover:opacity-60',
        primary: 'text-ink-primary border-b border-current pb-0.5 hover:opacity-60',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: { variant: 'link', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };