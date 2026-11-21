import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[8px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  { variants: {
    variant: {
      default: 'bg-primary text-on-primary hover:bg-primary-hover',
      secondary: 'bg-primary-tint text-on-primary-tint hover:bg-primary hover:text-on-primary',
      outline: 'border border-border-strong bg-surface text-on-surface hover:bg-surface-subtle',
      ghost: 'text-on-surface-muted hover:bg-surface-subtle hover:text-on-surface',
      danger: 'bg-error-tint text-error hover:bg-error hover:text-on-primary',
      terracotta: 'border border-terracotta bg-surface text-terracotta-text',
    },
    size: { default: 'h-10 px-4', sm: 'h-9 px-3 text-xs', icon: 'size-10' },
  }, defaultVariants: { variant: 'default', size: 'default' } },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
