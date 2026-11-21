
import { useState } from 'react'
import { ArrowLeft, Users } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { Badge } from '../ui/primitives'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'

export function CommunitySpace() {
  const { id } = useParams()
  const { communities, posts, toggleCommunity } = useApp()
  const [loading, setLoading] = useState(false)

  const community = communities.find((item) => item.id === id)

  if (!community) return <Navigate to="/discover" replace />

  const communityPosts = posts.filter(
    (post) => post.communityId === community.id,
  )

  const handleToggle = async () => {
    try {
      setLoading(true)
      await toggleCommunity(community.id)
    } catch (error) {
      console.error('Community membership error:', error)
      alert('Unable to update membership. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/discover"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-teal-700"
      >
        <ArrowLeft className="size-4" />
        All communities
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="h-32 bg-gradient-to-r from-teal-700 to-cyan-600" />

        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <span className="grid size-20 place-items-center rounded-2xl border-4 border-white bg-teal-50 text-4xl shadow-sm">
              {community.cover}
            </span>

            <Button
              variant={community.joined ? 'outline' : 'default'}
              onClick={handleToggle}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : community.joined
                  ? 'Leave community'
                  : 'Join community'}
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-950">
              {community.name}
            </h1>
            <Badge>{community.category}</Badge>
          </div>

          <p className="mt-2 max-w-2xl text-slate-600">
            {community.description}
          </p>

          <p className="mt-4 flex items-center gap-1 text-sm text-slate-500">
            <Users className="size-4" />
            {community.members.toLocaleString()} members
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl space-y-5">
        {community.joined && <PostComposer communityId={community.id} />}

        {communityPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {communityPosts.length === 0 && (
          <p className="py-10 text-center text-slate-500">
            No posts yet. Start the conversation.
          </p>
        )}
      </div>
    </div>
  )
}
