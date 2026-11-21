import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50',
  { variants: {
    variant: {
      default: 'bg-teal-700 text-white hover:bg-teal-800',
      secondary: 'bg-teal-50 text-teal-800 hover:bg-teal-100',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      danger: 'bg-red-50 text-red-700 hover:bg-red-100',
    },
    size: { default: 'h-10 px-4', sm: 'h-9 px-3', icon: 'size-10' },
  }, defaultVariants: { variant: 'default', size: 'default' } },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
