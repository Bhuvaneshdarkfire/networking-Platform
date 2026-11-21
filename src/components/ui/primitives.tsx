import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-[#E7E0D6] bg-white shadow-sm', className)} {...props} />
}

export function Avatar({ label, src, className }: { label: string; src?: string; className?: string }) {
  return <span className={cn('inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E4F0E9] text-sm font-bold text-[#1E4633]', className)}>{src ? <img src={src} alt={label} className="size-full object-cover" /> : label}</span>
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex rounded-full bg-[#F3EFE8] px-2.5 py-1 text-xs font-medium text-[#6F675E]', className)}>{children}</span>
}

export const fieldClass = 'w-full rounded-lg border border-[#E7E0D6] bg-white px-3 py-2.5 text-sm text-[#2B2622] outline-none placeholder:text-[#8A8178] focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#E4F0E9]'
