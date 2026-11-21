import { MapPin, Pencil, Save, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { interestOptions } from '../../lib/mock-data'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Avatar, Badge, Card, fieldClass } from '../ui/primitives'

export function UserProfile() {
  const { member, posts, communities, updateProfile } = useApp()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(member)
  const myPosts = posts.filter((post) => post.author.id === member.id)

  const toggleInterest = (interest: string) => setDraft((value) => ({ ...value, interests: value.interests.includes(interest) ? value.interests.filter((item) => item !== interest) : [...value.interests, interest] }))
  const save = (event: FormEvent) => { event.preventDefault(); updateProfile(draft); setEditing(false) }

  return <div className="mx-auto max-w-4xl space-y-6">
    <Card className="overflow-hidden"><div className="h-36 bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-600" /><div className="px-6 pb-6"><div className="-mt-12 flex items-end justify-between"><Avatar label={member.avatar} className="size-24 border-4 border-white text-2xl shadow-sm" /><Button variant="outline" onClick={() => { setDraft(member); setEditing(true) }}><Pencil className="size-4" />Edit profile</Button></div><h1 className="mt-4 text-3xl font-bold text-slate-950">{member.name}</h1><p className="text-slate-500">{member.handle}</p><p className="mt-4 max-w-2xl text-slate-700">{member.bio}</p><p className="mt-3 flex items-center gap-1 text-sm text-slate-500"><MapPin className="size-4" />{member.location}</p><div className="mt-4 flex flex-wrap gap-2">{member.interests.map((interest) => <Badge key={interest} className="bg-teal-50 text-teal-800">{interest}</Badge>)}</div></div></Card>
    <div className="grid gap-4 sm:grid-cols-3">{[{ label: 'Posts', value: myPosts.length }, { label: 'Communities', value: communities.filter((item) => item.joined).length }, { label: 'Connections', value: 128 }].map((stat) => <Card key={stat.label} className="p-5 text-center"><p className="text-2xl font-bold text-slate-950">{stat.value}</p><p className="text-sm text-slate-500">{stat.label}</p></Card>)}</div>
    {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-slate-950">Edit profile</h2><button onClick={() => setEditing(false)} aria-label="Close"><X /></button></div><form className="mt-5 space-y-4" onSubmit={save}><label className="block text-sm font-medium text-slate-700">Name<input className={`${fieldClass} mt-1`} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="block text-sm font-medium text-slate-700">Bio<textarea className={`${fieldClass} mt-1 min-h-24`} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></label><label className="block text-sm font-medium text-slate-700">Location<input className={`${fieldClass} mt-1`} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></label><fieldset><legend className="text-sm font-medium text-slate-700">Interests</legend><div className="mt-2 flex flex-wrap gap-2">{interestOptions.map((interest) => <button type="button" key={interest} onClick={() => toggleInterest(interest)} className={cn('rounded-full px-3 py-1.5 text-sm ring-1', draft.interests.includes(interest) ? 'bg-teal-700 text-white ring-teal-700' : 'bg-white text-slate-600 ring-slate-200')}>{interest}</button>)}</div></fieldset><Button className="w-full" type="submit"><Save className="size-4" />Save changes</Button></form></Card></div>}
  </div>
}
