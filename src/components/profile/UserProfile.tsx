import { MapPin, Pencil, Save, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { interestOptions } from '../../lib/mock-data'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Avatar, Card } from '../ui/primitives'

export function UserProfile() {
  const { member, posts, communities, updateProfile } = useApp()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(member)
  const [activeTab, setActiveTab] = useState(0)
  const myPosts = posts.filter((p) => p.author.id === member.id)
  const tabs = ['About', 'Posts', 'Communities', 'Connections']

  const toggleInterest = (interest: string) => setDraft((v) => ({
    ...v, interests: v.interests.includes(interest) ? v.interests.filter((i) => i !== interest) : [...v.interests, interest]
  }))
  const save = (e: FormEvent) => { e.preventDefault(); updateProfile(draft); setEditing(false) }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-primary via-primary to-primary-hover" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between">
            <Avatar label={member.avatar} className="size-24 border-4 border-surface text-2xl" />
            <Button variant="outline" onClick={() => { setDraft(member); setEditing(true) }}><Pencil className="size-4" /> Edit profile</Button>
          </div>
          <h1 className="mt-4 font-heading text-[26px] font-semibold text-on-surface">{member.name}</h1>
          <p className="text-on-surface-muted">{member.handle}</p>
          {member.title && <p className="mt-1 text-sm text-on-surface-muted">{member.title}</p>}
          <p className="mt-4 text-[15px] text-on-surface">{member.bio}</p>
          <p className="mt-3 flex items-center gap-1 text-sm text-on-surface-muted"><MapPin className="size-4" />{member.location}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {member.interests.map((interest) => <span key={interest} className="px-2.5 py-1 rounded-[8px] bg-primary-tint text-on-primary-tint text-xs font-medium">#{interest}</span>)}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[{ label: 'Posts', value: myPosts.length }, { label: 'Communities', value: communities.filter((c) => c.joined).length }, { label: 'Connections', value: 128 }].map((stat) => (
          <Card key={stat.label} className="p-5 text-center">
            <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
            <p className="text-sm text-on-surface-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex items-center gap-6 border-b border-border">
        {tabs.map((tab, i) => (
          <button key={tab} role="tab" aria-selected={i === activeTab} onClick={() => setActiveTab(i)}
            className={cn('pb-3 border-b-2 -mb-px text-sm font-medium transition-colors',
              i === activeTab ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface'
            )}>{tab}</button>
        ))}
      </div>

      {activeTab === 0 && <p className="text-on-surface-muted text-sm">Member since 2024. Active in {communities.filter((c) => c.joined).length} communities.</p>}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-on-background/50 p-4" role="dialog" aria-modal="true">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-on-surface">Edit profile</h2>
              <button onClick={() => setEditing(false)} aria-label="Close"><X className="size-5" /></button>
            </div>
            <form className="mt-5 space-y-4" onSubmit={save}>
              <label className="block text-sm font-medium text-on-surface">Name
                <input className="mt-1 w-full rounded-[8px] border border-border bg-surface-subtle px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary-tint focus:outline-none" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </label>
              <label className="block text-sm font-medium text-on-surface">Bio
                <textarea className="mt-1 w-full rounded-[8px] border border-border bg-surface-subtle px-4 py-2.5 text-sm min-h-24 focus:border-primary focus:ring-2 focus:ring-primary-tint focus:outline-none resize-none" value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
              </label>
              <label className="block text-sm font-medium text-on-surface">Location
                <input className="mt-1 w-full rounded-[8px] border border-border bg-surface-subtle px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary-tint focus:outline-none" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
              </label>
              <fieldset>
                <legend className="text-sm font-medium text-on-surface">Interests</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                      className={cn('rounded-[8px] px-3 py-1.5 text-sm ring-1', draft.interests.includes(interest) ? 'bg-primary text-on-primary ring-primary' : 'bg-surface text-on-surface-muted ring-border')}>
                      {interest}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Button className="w-full" type="submit"><Save className="size-4" /> Save changes</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
