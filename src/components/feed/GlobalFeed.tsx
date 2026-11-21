import { Filter, LoaderCircle, TrendingUp, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import { Avatar, Card } from '../ui/primitives'
import { PostCard } from './PostCard'

type FeedFilter = 'all' | 'joined' | 'media' | 'text'

export function GlobalFeed() {
  const { posts, communities, people, loading, error } = useApp()
  const [filter, setFilter] = useState<FeedFilter>('all')
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')
  const joinedIds = useMemo(() => new Set(communities.filter((community) => community.joined).map((community) => community.id)), [communities])
  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (filter === 'joined') return !post.communityId || joinedIds.has(post.communityId)
      if (filter === 'media') return Boolean(post.mediaUrl)
      if (filter === 'text') return !post.mediaUrl
      return true
    })
    return sort === 'popular' ? [...filtered].sort((a, b) => b.likes - a.likes) : filtered
  }, [posts, filter, sort, joinedIds])

  const filters: Array<[FeedFilter, string]> = [['all', 'All posts'], ['joined', 'My communities'], ['media', 'Media'], ['text', 'Text only']]
  return <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,680px)_300px] xl:justify-center">
    <section className="min-w-0 space-y-5"><header><p className="text-xs font-semibold uppercase tracking-wider text-[#2F6B4F]">Your network</p><h1 className="font-heading text-3xl font-semibold">Global Feed</h1><p className="mt-1 text-sm text-[#6F675E]">Ideas, updates, and media from your communities.</p></header>
      <Card className="p-3"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-1 overflow-x-auto"><Filter className="mr-1 size-4 shrink-0 text-[#6F675E]" />{filters.map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={cn('whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold', filter === value ? 'bg-[#2F6B4F] text-white' : 'text-[#6F675E] hover:bg-[#F3EFE8]')}>{label}</button>)}</div><select value={sort} onChange={(event) => setSort(event.target.value as 'latest' | 'popular')} className="rounded-lg border border-[#E7E0D6] bg-white px-3 py-2 text-xs font-medium outline-none"><option value="latest">Latest first</option><option value="popular">Most liked</option></select></div></Card>
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}{loading ? <LoaderCircle className="mx-auto animate-spin text-[#2F6B4F]" /> : visiblePosts.map((post) => <PostCard key={post.id} post={post} />)}{!loading && visiblePosts.length === 0 && <div className="rounded-xl border border-dashed border-[#D5CCC0] p-10 text-center text-sm text-[#6F675E]">No posts match this filter. Use the Create post button to share something.</div>}
    </section>
    <aside className="hidden space-y-4 xl:block"><Card className="p-4"><div className="flex items-center gap-2"><TrendingUp className="size-4 text-[#D9734E]" /><h2 className="font-heading text-lg font-semibold">Active communities</h2></div><div className="mt-4 space-y-3">{communities.slice(0, 4).map((community) => <Link key={community.id} to={`/communities/${community.id}`} className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[#F3EFE8]">{community.cover}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{community.name}</p><p className="text-xs text-[#6F675E]"><Users className="mr-1 inline size-3" />{community.members} members</p></div></Link>)}</div></Card><Card className="p-4"><h2 className="font-heading text-lg font-semibold">People to know</h2><div className="mt-4 space-y-3">{people.slice(0, 4).map((person) => <Link to="/discover" key={person.id} className="flex items-center gap-3"><Avatar label={person.avatar} src={person.avatarUrl} className="size-9" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{person.name}</p><p className="truncate text-xs text-[#6F675E]">{person.location || person.handle}</p></div></Link>)}</div></Card></aside>
  </div>
}
