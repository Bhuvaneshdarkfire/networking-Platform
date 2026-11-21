import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[10px] border border-border bg-surface', className)} {...props} />
}

export function Avatar({ src, label, className }: { src?: string; label: string; className?: string }) {
  if (src) {
    return <img src={src} alt={label} className={cn('size-10 shrink-0 rounded-full object-cover ring-1 ring-border', className)} />
  }
  return <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm font-bold text-on-primary-tint', className)}>{label}</span>
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex rounded-full bg-primary-tint px-2.5 py-1 text-xs font-medium text-on-primary-tint', className)}>{children}</span>
}

export const fieldClass = 'w-full rounded-[8px] border border-border bg-surface-subtle px-4 py-2.5 text-[15px] text-on-surface outline-none placeholder:text-on-surface-subtle focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary-tint transition-colors'
