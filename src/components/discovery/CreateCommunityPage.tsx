import { ArrowLeft, Check, Image, LoaderCircle, Plus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Badge, Card, fieldClass } from '../ui/primitives'

const steps = ['Basics', 'Rules and privacy', 'Review']

export function CreateCommunityPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [cover, setCover] = useState<File>()
  const [form, setForm] = useState({ name: '', slug: '', category: 'Technology', description: '', tags: [] as string[], tag: '', visibility: 'public', rules: ['Be kind and constructive'] })

  const addTag = () => { const value = form.tag.trim().replace(/^#/, ''); if (value && !form.tags.includes(value)) setForm({ ...form, tags: [...form.tags, value], tag: '' }) }
  const publish = async (event: FormEvent) => {
    event.preventDefault(); if (!user) return; setBusy(true); setError('')
    try {
      let coverUrl: string | undefined
      if (cover) {
        const path = `${user.id}/community-${crypto.randomUUID()}.${cover.name.split('.').pop() || 'jpg'}`
        const upload = await supabase.storage.from('post-media').upload(path, cover)
        if (upload.error) throw upload.error
        coverUrl = supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl
      }
      const { data, error: createError } = await supabase.from('communities').insert({ name: form.name, slug: form.slug, category: form.category, description: form.description, tags: form.tags, rules: form.rules, visibility: form.visibility, owner_id: user.id, cover_url: coverUrl }).select('id').single()
      if (createError) throw createError
      navigate(`/communities/${data.id}`)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Community could not be created') }
    finally { setBusy(false) }
  }

  return <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
    <section className="min-w-0"><Link to="/communities" className="mb-4 inline-flex items-center gap-1 text-sm text-[#6F675E]"><ArrowLeft className="size-4" />Communities</Link><h1 className="font-heading text-3xl font-semibold">Create a community</h1><p className="mt-1 text-sm text-[#6F675E]">Start a space where people with shared interests can talk, learn, and build together.</p>
      <div className="my-6 grid grid-cols-3 rounded-lg border border-[#E7E0D6] bg-white p-2">{steps.map((label, index) => <div key={label} className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold', step === index && 'bg-[#E4F0E9] text-[#1E4633]')}><span className={cn('grid size-5 place-items-center rounded-full', index < step ? 'bg-[#2F6B4F] text-white' : 'bg-[#F3EFE8]')}>{index < step ? <Check className="size-3" /> : index + 1}</span><span className="hidden sm:inline">{label}</span></div>)}</div>
      <form onSubmit={(event) => void publish(event)}><Card className="border-2 border-[#7967E8] p-5 sm:p-7">
        {step === 0 && <div className="space-y-5"><div><h2 className="font-heading text-xl font-semibold">Community basics</h2><p className="text-sm text-[#6F675E]">Give your new space a clear identity.</p></div><label className="block text-sm font-semibold">Name<input required className={`${fieldClass} mt-1`} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">URL slug<input required className={`${fieldClass} mt-1`} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label><label className="block text-sm font-semibold">Category<select className={`${fieldClass} mt-1`} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Technology</option><option>Startups</option><option>Design</option><option>Education</option><option>Local</option></select></label></div><label className="block text-sm font-semibold">Description<textarea required className={`${fieldClass} mt-1 min-h-24`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="block text-sm font-semibold">Cover image<input type="file" accept="image/jpeg,image/png,image/webp" className={`${fieldClass} mt-1`} onChange={(event) => setCover(event.target.files?.[0])} /></label><div><p className="text-sm font-semibold">Tags</p><div className="mt-1 flex gap-2"><input className={fieldClass} value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} placeholder="React" /><Button type="button" variant="outline" onClick={addTag}><Plus className="size-4" /></Button></div><div className="mt-2 flex flex-wrap gap-2">{form.tags.map((tag) => <Badge key={tag}>#{tag}<button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter((item) => item !== tag) })}><X className="ml-1 size-3" /></button></Badge>)}</div></div></div>}
        {step === 1 && <div className="space-y-5"><div><h2 className="font-heading text-xl font-semibold">Rules and privacy</h2><p className="text-sm text-[#6F675E]">Set expectations for a welcoming community.</p></div><label className="block text-sm font-semibold">Visibility<select className={`${fieldClass} mt-1`} value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value })}><option value="public">Public — anyone can discover and join</option><option value="private">Private — members join by invitation</option></select></label><div><p className="text-sm font-semibold">Community rules</p>{form.rules.map((rule, index) => <div key={index} className="mt-2 flex gap-2"><input className={fieldClass} value={rule} onChange={(event) => setForm({ ...form, rules: form.rules.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} /><button type="button" onClick={() => setForm({ ...form, rules: form.rules.filter((_, itemIndex) => itemIndex !== index) })}><X className="size-4" /></button></div>)}<Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setForm({ ...form, rules: [...form.rules, ''] })}><Plus className="size-4" />Add rule</Button></div></div>}
        {step === 2 && <div><h2 className="font-heading text-xl font-semibold">Review your community</h2><p className="text-sm text-[#6F675E]">Check everything before you publish. You can edit details later.</p><div className="mt-5 overflow-hidden rounded-lg border border-[#E7E0D6]">{cover ? <img src={URL.createObjectURL(cover)} className="h-36 w-full object-cover" alt="Cover preview" /> : <div className="grid h-36 place-items-center bg-[#F3EFE8]"><Image className="size-8 text-[#8A8178]" /></div>}<div className="p-4"><div className="flex items-center justify-between"><h3 className="font-heading text-xl font-semibold">{form.name || 'Untitled community'}</h3><Badge className="bg-[#E4F0E9] text-[#1E4633]">{form.visibility}</Badge></div><p className="mt-2 text-sm text-[#6F675E]">{form.description}</p><div className="mt-3 flex flex-wrap gap-2">{form.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>)}</div></div></div><div className="mt-4 rounded-lg border border-[#E7E0D6] p-4"><p className="font-heading font-semibold">Rules and privacy</p><ol className="mt-2 list-inside list-decimal text-sm text-[#6F675E]">{form.rules.filter(Boolean).map((rule) => <li key={rule}>{rule}</li>)}</ol></div></div>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-between border-t border-[#E7E0D6] pt-4"><Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Back</Button>{step < 2 ? <Button type="button" onClick={() => setStep((value) => value + 1)}>Continue</Button> : <Button disabled={busy}>{busy && <LoaderCircle className="size-4 animate-spin" />}Publish community</Button>}</div>
      </Card></form>
    </section>
    <aside className="space-y-4"><Card className="p-4"><h2 className="font-heading text-lg font-semibold">What happens next</h2><ol className="mt-3 space-y-3 text-sm text-[#6F675E]">{['Share your invite link with founding members.', 'Post a warm welcome message.', 'Pin your community rules.'].map((item, index) => <li key={item} className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#E4F0E9] text-xs text-[#2F6B4F]">{index + 1}</span>{item}</li>)}</ol></Card><Card className="p-4"><h2 className="font-heading text-lg font-semibold">Community guidelines</h2><p className="mt-2 text-sm leading-6 text-[#6F675E]">Every Connectly space follows shared standards for respectful discussion and moderation.</p></Card></aside>
  </div>
}
