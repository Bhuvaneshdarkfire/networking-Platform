import { Bell, Compass, Home, Menu, Search, Users, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/primitives'

const navigation = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Feed', icon: Users },
  { to: '/discover', label: 'Discover', icon: Compass },
]

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { member } = useApp()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-950">
            <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-white">C</span>
            <span className="hidden sm:block">Connectly</span>
          </NavLink>
          <div className="relative mx-auto hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input className="w-full rounded-xl bg-slate-100 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-teal-100" placeholder="Search people and communities" />
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium', isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100')}>
                <Icon className="size-4" />{label}
              </NavLink>
            ))}
          </nav>
          <button className="relative grid size-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Notifications">
            <Bell className="size-5" /><span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500" />
          </button>
          <NavLink to="/profile" aria-label="Profile"><Avatar label={member.avatar} /></NavLink>
          <button className="grid size-10 place-items-center rounded-xl md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && <nav className="space-y-1 border-t bg-white p-3 md:hidden">
          {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"><Icon className="size-5" />{label}</NavLink>)}
        </nav>}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><Outlet /></main>
    </div>
  )
}
