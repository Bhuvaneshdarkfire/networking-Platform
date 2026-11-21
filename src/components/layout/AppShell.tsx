import { Bell, Compass, Home, Link2, LogOut, Menu, MessageCircle, Plus, Search, Settings, User, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/primitives'

const navigation = [
  { to: '/', label: 'Global Feed', icon: Home },
  { to: '/discover', label: 'Discover People', icon: Compass },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/communities', label: 'Communities', icon: Users },
]

export function AppShell() {
  const [drawer, setDrawer] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [noticesOpen, setNoticesOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; read: boolean; created_at: string }>>([])
  const { member } = useApp()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase.from('notifications').select('id,message,read,created_at').order('created_at', { ascending: false }).limit(10)
      setNotifications(data ?? [])
    }
    void load()
    const channel = supabase.channel('header-notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` }, () => void load()).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user])

  const openNotifications = async () => {
    setNoticesOpen((open) => !open); setAccountOpen(false)
    if (notifications.some((notice) => !notice.read)) {
      await supabase.from('notifications').update({ read: true }).eq('recipient_id', user?.id).eq('read', false)
      setNotifications((items) => items.map((item) => ({ ...item, read: true })))
    }
  }
  const unread = notifications.filter((notice) => !notice.read).length

  return <div className="min-h-screen bg-[#FAF7F2] text-[#2B2622]">
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-[#E7E0D6] bg-white px-4 lg:px-6">
      <div className="flex shrink-0 items-center gap-2"><button className="grid size-10 place-items-center rounded hover:bg-[#F3EFE8] md:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu className="size-5" /></button><Link to="/" className="flex items-center gap-2 font-heading text-lg font-semibold"><span className="grid size-8 place-items-center rounded bg-[#2F6B4F] text-white"><Link2 className="size-4" /></span>Connectly</Link></div>
      <label className="relative mx-auto hidden w-full max-w-lg sm:block"><Search className="absolute left-3 top-2.5 size-4 text-[#6F675E]" /><input type="search" className="w-full rounded-lg border border-[#E7E0D6] bg-[#F3EFE8] py-2 pl-10 pr-3 text-sm outline-none focus:border-[#2F6B4F] focus:bg-white" placeholder="Search people, communities, topics" /></label>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2"><Link to="/?create=1" className="hidden items-center gap-2 rounded-lg bg-[#2F6B4F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#245640] sm:flex"><Plus className="size-4" />Create</Link><Link to="/messages" className="hidden size-10 items-center justify-center rounded hover:bg-[#F3EFE8] sm:flex" aria-label="Messages"><MessageCircle className="size-5" /></Link>
        <div className="relative"><button onClick={() => void openNotifications()} className="relative grid size-10 place-items-center rounded hover:bg-[#F3EFE8]" aria-label="Notifications"><Bell className="size-5" />{unread > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#D9734E] px-1 text-[10px] font-bold text-white">{unread}</span>}</button>{noticesOpen && <div className="absolute right-0 mt-2 w-72 rounded-lg border border-[#E7E0D6] bg-white p-2 shadow-lg"><p className="px-2 py-2 font-heading font-semibold">Notifications</p>{notifications.length ? notifications.map((notice) => <div key={notice.id} className="border-t border-[#F3EFE8] px-2 py-3 text-sm">{notice.message}</div>) : <p className="p-4 text-center text-sm text-[#6F675E]">Nothing new yet.</p>}</div>}</div>
        <div className="relative"><button onClick={() => { setAccountOpen((open) => !open); setNoticesOpen(false) }}><Avatar label={member?.avatar ?? 'U'} src={member?.avatarUrl} className="size-8" /></button>{accountOpen && <div className="absolute right-0 mt-2 w-52 rounded-lg border border-[#E7E0D6] bg-white py-1 shadow-lg"><Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F3EFE8]"><User className="size-4" />Profile</Link><Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F3EFE8]"><Settings className="size-4" />Settings</Link><button onClick={() => void logout()} className="flex w-full items-center gap-2 border-t border-[#E7E0D6] px-3 py-2 text-sm text-red-700 hover:bg-red-50"><LogOut className="size-4" />Log out</button></div>}</div>
      </div>
    </header>

    <div className="mx-auto flex min-h-screen max-w-[1440px] pt-16 pb-16 md:pb-0">
      <aside className="fixed bottom-0 left-0 top-16 hidden w-[72px] border-r border-[#E7E0D6] bg-white md:block lg:w-64"><nav className="space-y-1 p-2 lg:p-4"><p className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[#8A8178] lg:block">Main</p>{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium lg:justify-start', isActive ? 'border-l-2 border-[#2F6B4F] bg-[#E4F0E9] text-[#1E4633]' : 'text-[#6F675E] hover:bg-[#F3EFE8]')}><Icon className="size-5 shrink-0" /><span className="hidden lg:inline">{label}</span></NavLink>)}<p className="hidden px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-[#8A8178] lg:block">Account</p><NavLink to="/profile" className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6F675E] hover:bg-[#F3EFE8] lg:justify-start"><User className="size-5" /><span className="hidden lg:inline">Profile</span></NavLink></nav></aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:ml-[72px] lg:ml-64 lg:px-6"><Outlet /></main>
    </div>

    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-[#E7E0D6] bg-white md:hidden">{navigation.slice(0, 2).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('flex flex-col items-center justify-center gap-0.5 text-[11px]', isActive ? 'text-[#2F6B4F]' : 'text-[#6F675E]')}><Icon className="size-5" />{label.split(' ')[0]}</NavLink>)}<Link to="/?create=1" className="flex flex-col items-center justify-center gap-0.5 text-[11px] text-[#2F6B4F]"><span className="grid size-8 place-items-center rounded bg-[#2F6B4F] text-white"><Plus className="size-4" /></span>Create</Link>{navigation.slice(2, 3).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => cn('flex flex-col items-center justify-center gap-0.5 text-[11px]', isActive ? 'text-[#2F6B4F]' : 'text-[#6F675E]')}><Icon className="size-5" />{label}</NavLink>)}<NavLink to="/profile" className={({ isActive }) => cn('flex flex-col items-center justify-center gap-0.5 text-[11px]', isActive ? 'text-[#2F6B4F]' : 'text-[#6F675E]')}><User className="size-5" />Profile</NavLink></nav>

    {drawer && <div className="fixed inset-0 z-50 md:hidden"><button className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} aria-label="Close menu" /><aside className="relative h-full w-72 bg-white p-4"><div className="mb-6 flex items-center justify-between font-heading text-lg font-semibold">Connectly<button onClick={() => setDrawer(false)}><X /></button></div>{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#6F675E] hover:bg-[#F3EFE8]"><Icon className="size-5" />{label}</NavLink>)}</aside></div>}
  </div>
}
