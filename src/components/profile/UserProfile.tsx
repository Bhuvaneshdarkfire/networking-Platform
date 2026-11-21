import { Camera, LoaderCircle, MapPin, Pencil, Save, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { interestOptions } from '../../lib/mock-data'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Avatar, Badge, Card, fieldClass } from '../ui/primitives'

export function UserProfile() {
  const { member, posts, communities, updateProfile, loading } = useApp()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(member)
  const [avatarFile, setAvatarFile] = useState<File>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Keep the edit form synchronized after backend refreshes.
    setDraft(member)
  }, [member])
  if (loading || !member || !draft) return <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-[#2F6B4F]" /></div>
  const myPosts = posts.filter((post) => post.author.id === member.id)
  const toggleInterest = (interest: string) => setDraft((value) => value ? ({ ...value, interests: value.interests.includes(interest) ? value.interests.filter((item) => item !== interest) : [...value.interests, interest] }) : value)
  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try { await updateProfile(draft, avatarFile); setEditing(false); setAvatarFile(undefined) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Profile could not be saved') }
    finally { setBusy(false) }
  }

  return <div className="mx-auto max-w-4xl space-y-6"><Card className="overflow-hidden"><div className="h-36 bg-gradient-to-r from-[#2F6B4F] to-[#5C8D73]" /><div className="px-6 pb-6"><div className="-mt-12 flex items-end justify-between"><Avatar label={member.avatar} src={member.avatarUrl} className="size-24 border-4 border-white text-2xl shadow-sm" /><Button variant="outline" onClick={() => { setDraft(member); setEditing(true) }}><Pencil className="size-4" />Edit profile</Button></div><h1 className="mt-4 font-heading text-3xl font-semibold">{member.name}</h1><p className="text-[#6F675E]">{member.handle}</p><p className="mt-4 max-w-2xl">{member.bio || 'Add a short bio to help people know you.'}</p><p className="mt-3 flex items-center gap-1 text-sm text-[#6F675E]"><MapPin className="size-4" />{member.location || 'Add your location'}</p><div className="mt-4 flex flex-wrap gap-2">{member.interests.map((interest) => <Badge key={interest} className="bg-[#E4F0E9] text-[#1E4633]">{interest}</Badge>)}</div></div></Card>
    <div className="grid gap-4 sm:grid-cols-3">{[{ label: 'Posts', value: myPosts.length }, { label: 'Communities', value: communities.filter((item) => item.joined).length }, { label: 'Interests', value: member.interests.length }].map((stat) => <Card key={stat.label} className="p-5 text-center"><p className="font-heading text-2xl font-semibold">{stat.value}</p><p className="text-sm text-[#6F675E]">{stat.label}</p></Card>)}</div>
    {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true"><Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"><div className="flex items-center justify-between"><h2 className="font-heading text-2xl font-semibold">Edit profile</h2><button onClick={() => setEditing(false)}><X /></button></div><form className="mt-5 space-y-4" onSubmit={(event) => void save(event)}><label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E7E0D6] p-3"><Avatar label={member.avatar} src={avatarFile ? URL.createObjectURL(avatarFile) : member.avatarUrl} /><span className="text-sm font-medium"><Camera className="mr-2 inline size-4" />Change avatar</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => setAvatarFile(event.target.files?.[0])} /></label><label className="block text-sm font-medium">Name<input className={`${fieldClass} mt-1`} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="block text-sm font-medium">Bio<textarea className={`${fieldClass} mt-1 min-h-24`} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></label><label className="block text-sm font-medium">Location<input className={`${fieldClass} mt-1`} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></label><fieldset><legend className="text-sm font-medium">Interests</legend><div className="mt-2 flex flex-wrap gap-2">{interestOptions.map((interest) => <button type="button" key={interest} onClick={() => toggleInterest(interest)} className={cn('rounded-full px-3 py-1.5 text-sm ring-1', draft.interests.includes(interest) ? 'bg-[#2F6B4F] text-white ring-[#2F6B4F]' : 'bg-white text-[#6F675E] ring-[#E7E0D6]')}>{interest}</button>)}</div></fieldset>{error && <p className="text-sm text-red-600">{error}</p>}<Button className="w-full" disabled={busy}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}Save changes</Button></form></Card></div>}
  </div>
}
