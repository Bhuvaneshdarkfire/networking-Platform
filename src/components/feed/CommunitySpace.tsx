import { ArrowLeft, Users } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'

export function CommunitySpace() {
  const { id } = useParams()
  const { communities, posts, toggleCommunity } = useApp()
  const community = communities.find((c) => c.id === id)
  if (!community) return <Navigate to="/communities" replace />
  const communityPosts = posts.filter((p) => p.communityId === community.id)

  return (
    <div className="flex flex-col gap-6">
      <Link to="/communities" className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-muted hover:text-primary">
        <ArrowLeft className="size-4" /> All communities
      </Link>

      <section className="overflow-hidden rounded-[10px] border border-border bg-surface">
        <div className="h-32 bg-gradient-to-r from-primary to-primary-hover" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <span className="grid size-20 place-items-center rounded-[10px] border-4 border-surface bg-primary-tint text-4xl">{community.cover}</span>
            <Button variant={community.joined ? 'outline' : 'default'} onClick={() => toggleCommunity(community.id)}>
              {community.joined ? 'Leave' : 'Join'} community
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <h1 className="font-heading text-[26px] font-semibold text-on-surface">{community.name}</h1>
            <span className="px-2.5 py-1 rounded-[8px] bg-surface-subtle text-xs font-medium text-on-surface-muted">{community.category}</span>
          </div>
          <p className="mt-2 text-on-surface-muted max-w-2xl">{community.description}</p>
          <p className="mt-4 flex items-center gap-1 text-sm text-on-surface-muted"><Users className="size-4" />{community.members.toLocaleString()} members</p>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        {community.joined && <PostComposer communityId={community.id} />}
        {communityPosts.map((post) => <PostCard key={post.id} post={post} />)}
        {communityPosts.length === 0 && <p className="py-10 text-center text-on-surface-muted">No posts yet. Start the conversation.</p>}
      </div>
    </div>
  )
}
