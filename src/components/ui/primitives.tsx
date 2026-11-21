import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)} {...props} />
}

export function Avatar({ label, className }: { label: string; className?: string }) {
  return <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800', className)}>{label}</span>
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700', className)}>{children}</span>
}

export const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
