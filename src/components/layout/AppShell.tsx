import {
  Bell, Compass, Hash, Home, Link as LinkIcon, LogOut, Menu, MessageSquare, MoreHorizontal,
  PanelLeftClose, Plus, PlusCircle, Search, Settings, User, Users, X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import { trendingTopics } from '../../lib/mock-data'

const mainNav = [
  { to: '/feed', label: 'Global Feed', icon: Home },
  { to: '/discover', label: 'Discover People', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
]
const communityNav = [
  { to: '/communities', label: 'My Communities', icon: Users },
  { to: '/communities/explore', label: 'Explore Communities', icon: Compass },
]
const accountNav = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SidebarLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof Home; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => cn(
      'flex items-center justify-center lg:justify-start gap-2 px-3 py-2.5 rounded-[8px] font-medium text-sm transition-colors',
      isActive
        ? 'bg-primary-tint border-l-2 border-primary text-on-primary-tint'
        : 'text-on-surface-muted hover:bg-surface-subtle hover:text-on-surface'
    )}>
      <Icon className="size-5 shrink-0" />
      <span className="hidden lg:inline">{label}</span>
    </NavLink>
  )
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { member } = useApp()
  const location = useLocation()

  const mobileNavItems = [
    { to: '/feed', label: 'Feed', icon: Home },
    { to: '/communities', label: 'Groups', icon: Users },
    { to: '/create', label: 'Create', icon: Plus, special: true },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-surface border-b border-border px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="md:hidden inline-flex items-center justify-center size-10 rounded-[8px] hover:bg-surface-subtle text-on-surface-muted" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <NavLink to="/" className="flex items-center gap-2">
            <span className="size-8 rounded-[8px] bg-primary text-on-primary flex items-center justify-center shrink-0">
              <LinkIcon className="size-4" />
            </span>
            <span className="font-heading text-[17px] font-semibold text-on-surface hidden sm:block">Connectly</span>
          </NavLink>
        </div>

        {/* Center: Search */}
        <div className="hidden sm:flex flex-1 max-w-lg mx-auto">
          <label className="relative flex items-center w-full">
            <Search className="absolute left-3 size-4 text-on-surface-subtle pointer-events-none" />
            <input type="search" placeholder="Search people, communities, topics" className="w-full pl-10 pr-4 py-2 rounded-[8px] border border-border bg-surface-subtle text-sm text-on-surface placeholder:text-on-surface-subtle focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary-tint focus:outline-none transition-colors" />
          </label>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button className="sm:hidden inline-flex items-center justify-center size-10 rounded-[8px] hover:bg-surface-subtle text-on-surface-muted" aria-label="Search">
            <Search className="size-5" />
          </button>
          <button className="hidden sm:inline-flex items-center justify-center gap-1 px-4 py-2 rounded-[8px] bg-primary hover:bg-primary-hover text-on-primary text-sm font-medium transition-colors">
            <Plus className="size-4" /> Create
          </button>
          <button className="hidden sm:inline-flex items-center justify-center size-10 rounded-[8px] hover:bg-surface-subtle text-on-surface-muted" aria-label="Messages">
            <MessageSquare className="size-5" />
          </button>
          <button className="relative inline-flex items-center justify-center size-10 rounded-[8px] hover:bg-surface-subtle text-on-surface-muted" aria-label="Notifications">
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-terracotta text-on-terracotta text-[10px] font-medium">3</span>
          </button>
          <NavLink to="/profile" className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-border-strong">
            <span className="size-8 rounded-full bg-primary-tint text-on-primary-tint flex items-center justify-center text-xs font-bold ring-1 ring-border">{member.avatar}</span>
          </NavLink>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="pt-16 pb-20 md:pb-0 flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar */}
        <aside className={cn(
          'hidden md:flex flex-col justify-between shrink-0 bg-surface border-r border-border min-h-screen p-2 lg:p-4 transition-all',
          sidebarCollapsed ? 'w-[72px]' : 'md:w-[72px] lg:w-64'
        )}>
          <nav className="flex flex-col gap-6">
            <div className="hidden lg:flex items-center justify-end">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="inline-flex items-center justify-center size-8 rounded-[8px] hover:bg-surface-subtle text-on-surface-subtle" aria-label="Collapse sidebar">
                <PanelLeftClose className="size-4" />
              </button>
            </div>

            {/* Main */}
            <div className="flex flex-col gap-1">
              <span className="hidden lg:block px-3 pb-1 text-[12px] font-medium text-on-surface-subtle uppercase tracking-wider">Main</span>
              {mainNav.map((item) => <SidebarLink key={item.to} {...item} />)}
            </div>

            {/* Communities */}
            <div className="flex flex-col gap-1">
              <span className="hidden lg:block px-3 pb-1 text-[12px] font-medium text-on-surface-subtle uppercase tracking-wider">Communities</span>
              {communityNav.map((item) => <SidebarLink key={item.to} {...item} />)}
              <NavLink to="/communities/create" className="flex items-center justify-center lg:justify-start gap-2 px-3 py-2.5 rounded-[8px] text-primary hover:bg-primary-tint font-medium text-sm transition-colors">
                <PlusCircle className="size-5 shrink-0" />
                <span className="hidden lg:inline">+ Create community</span>
              </NavLink>
            </div>

            {/* Account */}
            <div className="flex flex-col gap-1">
              <span className="hidden lg:block px-3 pb-1 text-[12px] font-medium text-on-surface-subtle uppercase tracking-wider">Account</span>
              {accountNav.map((item) => <SidebarLink key={item.to} {...item} />)}
            </div>
          </nav>

          <div className="pt-4 border-t border-border">
            <button className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2.5 rounded-[8px] text-on-surface-muted hover:bg-surface-subtle text-sm font-medium">
              <MoreHorizontal className="size-5 shrink-0" />
              <span className="hidden lg:inline">More</span>
            </button>
          </div>
        </aside>

        {/* Center Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 flex justify-center">
          <div className="w-full max-w-3xl">
            <Outlet />
          </div>
        </main>

        {/* Right Panel */}
        <aside className="hidden lg:flex flex-col gap-4 w-80 shrink-0 py-6 pr-6">
          {/* Suggested People */}
          <div className="rounded-[10px] bg-surface border border-border p-4 flex flex-col gap-3">
            <h2 className="font-heading text-[17px] font-semibold text-on-surface">Suggested People</h2>
            {[
              { name: 'Nadia Patel', role: 'Design Engineer', avatar: 'NP' },
              { name: 'Liam Chen', role: 'Product Lead', avatar: 'LC' },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-9 rounded-full bg-primary-tint text-on-primary-tint flex items-center justify-center text-xs font-bold ring-1 ring-border shrink-0">{p.avatar}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-on-surface truncate">{p.name}</span>
                    <span className="text-xs text-on-surface-muted truncate">{p.role}</span>
                  </div>
                </div>
                <button className="px-2.5 py-1 rounded-[8px] border border-border-strong hover:bg-surface-subtle text-xs font-medium text-on-surface shrink-0">Follow</button>
              </div>
            ))}
          </div>

          {/* Trending Topics */}
          <div className="rounded-[10px] bg-surface border border-border p-4 flex flex-col gap-3">
            <h2 className="font-heading text-[17px] font-semibold text-on-surface">Trending Topics</h2>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((tag, i) => (
                <span key={tag} className={cn(
                  'px-2.5 py-1 rounded-[8px] text-xs font-medium',
                  i === 0 ? 'bg-primary-tint text-on-primary-tint'
                    : i === 1 ? 'bg-terracotta-tint text-on-terracotta-tint'
                    : 'bg-surface-subtle text-on-surface-muted'
                )}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Active Communities */}
          <div className="rounded-[10px] bg-surface border border-border p-4 flex flex-col gap-3">
            <h2 className="font-heading text-[17px] font-semibold text-on-surface">Active Communities</h2>
            {[
              { name: 'Frontend Craft', members: '4.2k' },
              { name: 'Indie Founders', members: '2.8k' },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-on-surface truncate">{c.name}</span>
                  <span className="text-xs text-on-surface-muted">{c.members} members</span>
                </div>
                <span className="px-2 py-0.5 rounded-[8px] bg-primary-tint text-on-primary-tint text-xs font-medium">Active</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-surface border-t border-border grid grid-cols-5 items-center px-1">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          if (item.special) {
            return (
              <NavLink key={item.to} to={item.to} className="flex flex-col items-center justify-center gap-0.5 text-primary">
                <span className="size-8 rounded-[8px] bg-primary text-on-primary flex items-center justify-center">
                  <item.icon className="size-4" />
                </span>
                <span className="text-[11px]">{item.label}</span>
              </NavLink>
            )
          }
          return (
            <NavLink key={item.to} to={item.to} className={cn('flex flex-col items-center justify-center gap-0.5', isActive ? 'text-primary' : 'text-on-surface-muted')}>
              <item.icon className="size-5" />
              <span className="text-[11px]">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-on-background/40" onClick={() => setMenuOpen(false)} />
          <nav className="relative w-72 max-w-[80vw] min-h-screen bg-surface border-r border-border p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="font-heading text-[17px] font-semibold text-on-surface">Connectly</span>
                <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-[8px] hover:bg-surface-subtle text-on-surface-muted" aria-label="Close menu">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <span className="px-3 pb-1 text-xs font-medium text-on-surface-subtle uppercase tracking-wider">Main</span>
                {mainNav.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => cn('px-3 py-2 rounded-[8px] text-sm font-medium', isActive ? 'bg-primary-tint border-l-2 border-primary text-on-primary-tint' : 'text-on-surface-muted')}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <span className="px-3 pb-1 text-xs font-medium text-on-surface-subtle uppercase tracking-wider">Communities</span>
                {communityNav.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-[8px] text-sm font-medium text-on-surface-muted">
                    {item.label}
                  </NavLink>
                ))}
                <NavLink to="/communities/create" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-[8px] text-sm font-medium text-primary">
                  + Create community
                </NavLink>
              </div>
              <div className="flex flex-col gap-1">
                <span className="px-3 pb-1 text-xs font-medium text-on-surface-subtle uppercase tracking-wider">Account</span>
                {accountNav.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-[8px] text-sm font-medium text-on-surface-muted">
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <button className="block px-3 py-2 rounded-[8px] text-sm font-medium text-error">
                <span className="flex items-center gap-2"><LogOut className="size-4" /> Log out</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
