import { LoaderCircle, MapPin, MessageCircle, UserPlus, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Member } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Avatar, Badge, Card } from '../ui/primitives'
import { Button } from '../ui/button'
import { CommunityCard } from './CommunityCard'

interface Connection { id: string; requester_id: string; addressee_id: string; status: string }

export function Discovery() {
  const { people, communities, loading } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'people' | 'communities' | 'requests'>('people')
  const [topic, setTopic] = useState('All topics')
  const [connections, setConnections] = useState<Connection[]>([])
  const [busyId, setBusyId] = useState('')

  const loadConnections = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('connections').select('*').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    setConnections(data ?? [])
  }, [user])
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Initial data is loaded from Supabase after mount.
    void loadConnections()
  }, [loadConnections])

  const topics = useMemo(() => ['All topics', ...new Set(people.flatMap((person) => person.interests))].slice(0, 7), [people])
  const filtered = topic === 'All topics' ? people : people.filter((person) => person.interests.includes(topic))
  const incoming = connections.filter((connection) => connection.addressee_id === user?.id && connection.status === 'pending')
  const findPerson = (id: string) => people.find((person) => person.id === id)
  const connectionFor = (id: string) => connections.find((connection) => connection.requester_id === id || connection.addressee_id === id)

  const connect = async (person: Member) => {
    if (!user) return
    setBusyId(person.id)
    const existing = connectionFor(person.id)
    if (!existing) await supabase.from('connections').insert({ requester_id: user.id, addressee_id: person.id, status: 'pending' })
    await loadConnections(); setBusyId('')
  }
  const respond = async (connection: Connection, status: 'accepted' | 'declined') => {
    setBusyId(connection.id)
    await supabase.from('connections').update({ status }).eq('id', connection.id)
    await loadConnections(); setBusyId('')
  }

  return <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
    <section className="min-w-0 space-y-6">
      <header className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h1 className="font-heading text-3xl font-semibold">Discover People</h1><p className="mt-1 text-sm text-[#6F675E]">Meet builders, designers, and neighbors who share your curiosity.</p></div><p className="text-sm text-[#6F675E]">{connections.filter((item) => item.status === 'accepted').length} connections</p></header>
      <div className="border-b border-[#E7E0D6]"><div className="flex gap-5 overflow-x-auto">{([['people', 'People you may know'], ['communities', 'Communities'], ['requests', `Requests (${incoming.length})`]] as const).map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={cn('whitespace-nowrap border-b-2 pb-3 text-sm font-semibold', tab === value ? 'border-[#2F6B4F] text-[#2F6B4F]' : 'border-transparent text-[#6F675E]')}>{label}</button>)}</div></div>
      {tab === 'people' && <><div className="flex flex-wrap gap-2">{topics.map((item) => <button key={item} onClick={() => setTopic(item)} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold', topic === item ? 'bg-[#2F6B4F] text-white' : 'bg-[#F3EFE8] text-[#6F675E] hover:bg-[#E4F0E9]')}>{item === 'All topics' ? item : `#${item}`}</button>)}</div>
        {loading ? <LoaderCircle className="mx-auto animate-spin text-[#2F6B4F]" /> : <div className="grid gap-4 sm:grid-cols-2">{filtered.map((person) => {
          const connection = connectionFor(person.id)
          return <Card key={person.id} className="flex flex-col justify-between gap-4 p-5"><div><div className="flex items-center gap-3"><Avatar label={person.avatar} src={person.avatarUrl} className="size-12" /><div className="min-w-0"><h2 className="font-heading text-lg font-semibold">{person.name}</h2><p className="flex items-center gap-1 truncate text-sm text-[#6F675E]"><MapPin className="size-3" />{person.location || person.handle}</p></div></div><p className="mt-4 line-clamp-3 text-sm leading-6">{person.bio || 'New to Connectly and ready to meet the community.'}</p><div className="mt-3 flex flex-wrap gap-2">{person.interests.slice(0, 3).map((interest) => <Badge key={interest} className="bg-[#E4F0E9] text-[#1E4633]">#{interest}</Badge>)}</div></div><footer className="flex items-center justify-end gap-2 border-t border-[#E7E0D6] pt-3">{connection?.status === 'accepted' && <Button size="sm" variant="outline" onClick={() => navigate(`/messages?user=${person.id}`)}><MessageCircle className="size-4" />Message</Button>}<Button size="sm" disabled={busyId === person.id || Boolean(connection)} onClick={() => void connect(person)} variant={connection ? 'outline' : 'default'}>{connection?.status === 'accepted' ? 'Connected' : connection?.status === 'pending' ? 'Pending' : <><UserPlus className="size-4" />Connect</>}</Button></footer></Card>
        })}</div>}{!loading && filtered.length === 0 && <Empty text="No other profiles yet. Invite a teammate to create an account." />}</>}
      {tab === 'communities' && <div className="grid gap-4 sm:grid-cols-2">{communities.map((community) => <CommunityCard key={community.id} community={community} />)}{communities.length === 0 && <Empty text="No communities yet. Create the first one from Supabase or the upcoming community creator." />}</div>}
      {tab === 'requests' && <div className="space-y-3">{incoming.map((connection) => { const person = findPerson(connection.requester_id); if (!person) return null; return <Card key={connection.id} className="flex items-center gap-3 p-4"><Avatar label={person.avatar} src={person.avatarUrl} /><div className="min-w-0 flex-1"><p className="font-semibold">{person.name}</p><p className="text-sm text-[#6F675E]">wants to connect</p></div><Button size="sm" variant="outline" onClick={() => void respond(connection, 'declined')}>Decline</Button><Button size="sm" disabled={busyId === connection.id} onClick={() => void respond(connection, 'accepted')}>Accept</Button></Card> })}{incoming.length === 0 && <Empty text="You have no pending connection requests." />}</div>}
    </section>
    <aside className="hidden space-y-4 xl:block"><Card className="p-4"><h2 className="font-heading text-lg font-semibold">Suggested People</h2><div className="mt-4 space-y-3">{people.slice(0, 3).map((person) => <div key={person.id} className="flex items-center gap-2"><Avatar label={person.avatar} src={person.avatarUrl} className="size-9" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{person.name}</p><p className="truncate text-xs text-[#6F675E]">{person.location || person.handle}</p></div></div>)}</div></Card><Card className="p-4"><h2 className="font-heading text-lg font-semibold">Active Communities</h2><div className="mt-3 space-y-3">{communities.slice(0, 4).map((community) => <div key={community.id} className="flex items-center justify-between text-sm"><span className="font-medium">{community.name}</span><span className="text-xs text-[#6F675E]"><Users className="mr-1 inline size-3" />{community.members}</span></div>)}</div></Card></aside>
  </div>
}

function Empty({ text }: { text: string }) { return <div className="col-span-full rounded-xl border border-dashed border-[#D5CCC0] p-10 text-center text-sm text-[#6F675E]">{text}</div> }
