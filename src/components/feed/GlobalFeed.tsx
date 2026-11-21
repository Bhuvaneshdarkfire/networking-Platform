import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'

export function GlobalFeed() {
  const { posts, communities } = useApp()
  const [filter, setFilter] = useState<'all' | 'joined'>('all')
  const joinedIds = new Set(communities.filter((community) => community.joined).map((community) => community.id))
  const visiblePosts = filter === 'all' ? posts : posts.filter((post) => !post.communityId || joinedIds.has(post.communityId))

  return <div className="mx-auto max-w-2xl space-y-5">
    <div><h1 className="text-3xl font-bold text-slate-950">Community feed</h1><p className="mt-1 text-slate-600">Updates from people and spaces around you.</p></div>
    <PostComposer />
    <div className="flex gap-2 border-b border-slate-200">
      {(['all', 'joined'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={cn('border-b-2 px-3 py-2 text-sm font-semibold capitalize', filter === item ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-500')}>{item === 'joined' ? 'My communities' : 'For you'}</button>)}
    </div>
    {visiblePosts.map((post) => <PostCard key={post.id} post={post} />)}
  </div>
}
