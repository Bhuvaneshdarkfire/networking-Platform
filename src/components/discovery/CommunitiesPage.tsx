import { LoaderCircle, Plus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Card, fieldClass } from '../ui/primitives'
import { CommunityCard } from './CommunityCard'

export function CommunitiesPage() {
  const { communities, refresh } = useApp()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', slug: '', category: 'General', description: '' })

  const create = async (event: FormEvent) => {
    event.preventDefault(); if (!user) return; setBusy(true); setError('')
    const { error: createError } = await supabase.from('communities').insert({ ...form, owner_id: user.id })
    if (createError) setError(createError.message)
    else { await refresh(); setOpen(false); setForm({ name: '', slug: '', category: 'General', description: '' }) }
    setBusy(false)
  }

  return <div className="mx-auto max-w-6xl space-y-6"><header className="flex items-end justify-between gap-4"><div><h1 className="font-heading text-3xl font-semibold">Communities</h1><p className="mt-1 text-sm text-[#6F675E]">Join a space or start one around what matters to you.</p></div><Button onClick={() => setOpen(true)}><Plus className="size-4" />Create community</Button></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{communities.map((community) => <CommunityCard key={community.id} community={community} />)}{communities.length === 0 && <Card className="col-span-full p-12 text-center text-[#6F675E]">No communities yet. Create the first one.</Card>}</div>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"><Card className="w-full max-w-lg p-6"><div className="flex items-center justify-between"><h2 className="font-heading text-2xl font-semibold">Create a community</h2><button onClick={() => setOpen(false)}><X /></button></div><form className="mt-5 space-y-4" onSubmit={create}><label className="block text-sm font-medium">Name<input required className={`${fieldClass} mt-1`} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} /></label><label className="block text-sm font-medium">URL slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={`${fieldClass} mt-1`} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase() })} /></label><label className="block text-sm font-medium">Category<input required className={`${fieldClass} mt-1`} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label className="block text-sm font-medium">Description<textarea required className={`${fieldClass} mt-1 min-h-24`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>{error && <p className="text-sm text-red-600">{error}</p>}<Button className="w-full" disabled={busy}>{busy && <LoaderCircle className="size-4 animate-spin" />}Create community</Button></form></Card></div>}
  </div>
}
