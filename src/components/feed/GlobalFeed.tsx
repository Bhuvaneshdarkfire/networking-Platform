import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'

export function GlobalFeed() {
  const { posts, communities, loading, error } = useApp()
  const [filter, setFilter] = useState<'all' | 'joined'>('all')
  const joinedIds = new Set(communities.filter((community) => community.joined).map((community) => community.id))
  const visiblePosts = filter === 'all' ? posts : posts.filter((post) => !post.communityId || joinedIds.has(post.communityId))

  return <div className="mx-auto max-w-2xl space-y-5">
    <div><h1 className="text-3xl font-bold text-slate-950">Community feed</h1><p className="mt-1 text-slate-600">Updates from people and spaces around you.</p></div>
    <PostComposer />
    <div className="flex gap-2 border-b border-slate-200">
      {(['all', 'joined'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={cn('border-b-2 px-3 py-2 text-sm font-semibold capitalize', filter === item ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-500')}>{item === 'joined' ? 'My communities' : 'For you'}</button>)}
    </div>
    {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading ? <LoaderCircle className="mx-auto animate-spin text-[#2F6B4F]" /> : visiblePosts.map((post) => <PostCard key={post.id} post={post} />)}
    {!loading && visiblePosts.length === 0 && <div className="rounded-xl border border-dashed border-[#D5CCC0] p-10 text-center text-sm text-[#6F675E]">No posts yet. Share the first update.</div>}
  </div>
}
