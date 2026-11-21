import { Bell, Globe, Lock, Moon, Palette, Shield, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useState } from 'react'

const sections = [
  { icon: User, label: 'Account', description: 'Manage your name, email, and password' },
  { icon: Bell, label: 'Notifications', description: 'Choose what you get notified about' },
  { icon: Lock, label: 'Privacy', description: 'Control who can see your profile and activity' },
  { icon: Palette, label: 'Appearance', description: 'Theme, font size, and display preferences' },
  { icon: Globe, label: 'Language & Region', description: 'Set your language and timezone' },
  { icon: Shield, label: 'Security', description: 'Two-factor authentication and login sessions' },
]

export function SettingsPage() {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-[26px] font-semibold leading-[34px] tracking-tight text-on-surface">Settings</h1>

      <div className="rounded-[10px] bg-surface border border-border divide-y divide-border">
        {sections.map((section, i) => (
          <button key={section.label} onClick={() => setActive(i)}
            className={cn('w-full flex items-center gap-4 p-4 text-left hover:bg-surface-subtle transition-colors', i === active && 'bg-primary-tint/30')}>
            <span className="size-10 rounded-[8px] bg-surface-subtle flex items-center justify-center text-on-surface-muted shrink-0">
              <section.icon className="size-5" />
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-on-surface">{section.label}</span>
              <p className="text-xs text-on-surface-muted">{section.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-[10px] bg-surface border border-border p-6">
        <h2 className="font-heading text-lg font-semibold text-on-surface mb-4">{sections[active].label}</h2>
        <p className="text-sm text-on-surface-muted">Settings for {sections[active].label.toLowerCase()} will be available when backend is connected.</p>
        <p className="mt-2 text-xs text-on-surface-subtle">TODO: [BACKEND TEAM] — Implement settings API endpoints.</p>
      </div>
    </div>
  )
}
