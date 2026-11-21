import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] disabled:pointer-events-none disabled:opacity-50',
  { variants: {
    variant: {
      default: 'bg-[#2F6B4F] text-white hover:bg-[#245640]',
      secondary: 'bg-[#E4F0E9] text-[#1E4633] hover:bg-[#D6E8DE]',
      outline: 'border border-[#D5CCC0] bg-white text-[#2B2622] hover:bg-[#F3EFE8]',
      ghost: 'text-[#6F675E] hover:bg-[#F3EFE8] hover:text-[#2B2622]',
      danger: 'bg-red-50 text-red-700 hover:bg-red-100',
    },
    size: { default: 'h-10 px-4', sm: 'h-9 px-3', icon: 'size-10' },
  }, defaultVariants: { variant: 'default', size: 'default' } },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
