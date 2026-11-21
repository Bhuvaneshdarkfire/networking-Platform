
import { useState } from 'react'
import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { Community } from '../../lib/types'
import { Button } from '../ui/button'
import { Badge, Card } from '../ui/primitives'

export function CommunityCard({ community }: { community: Community }) {
  const { toggleCommunity } = useApp()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    try {
      setLoading(true)
      await toggleCommunity(community.id)
    } catch (error) {
      console.error('Community action failed:', error)
      alert('Unable to update community membership. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between">
        <span className="text-4xl">{community.cover}</span>
        <Badge>{community.category}</Badge>
      </div>

      <Link
        to={`/communities/${community.id}`}
        className="mt-4 text-lg font-bold text-slate-950 hover:text-teal-700"
      >
        {community.name}
      </Link>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
        {community.description}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Users className="size-4" />
          {community.members.toLocaleString()} members
        </span>

        <Button
          size="sm"
          variant={community.joined ? 'outline' : 'default'}
          onClick={handleToggle}
          disabled={loading}
        >
          {loading ? 'Please wait...' : community.joined ? 'Joined' : 'Join'}
        </Button>
      </div>
    </Card>
  )
}
