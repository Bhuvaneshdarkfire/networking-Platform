import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function MyCommunities() {
  const { communities, toggleCommunity } = useApp()
  const joined = communities.filter((c) => c.joined)
  const other = communities.filter((c) => !c.joined)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[26px] font-semibold leading-[34px] tracking-tight text-on-surface">My Communities</h1>
        <Link to="/communities/create">
          <Button size="sm">+ Create</Button>
        </Link>
      </div>

      {joined.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {joined.map((c) => (
            <article key={c.id} className="rounded-[10px] bg-surface border border-border p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{c.cover}</span>
                {c.status === 'active' && <span className="px-2 py-0.5 rounded-[8px] bg-primary-tint text-on-primary-tint text-xs font-medium">Active</span>}
              </div>
              <Link to={`/communities/${c.id}`} className="font-heading text-[17px] font-semibold text-on-surface hover:text-primary">{c.name}</Link>
              <p className="text-sm text-on-surface-muted flex-1">{c.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="flex items-center gap-1 text-xs text-on-surface-muted"><Users className="size-4" />{c.members.toLocaleString()} members</span>
                <Button size="sm" variant="outline" onClick={() => toggleCommunity(c.id)}>Leave</Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {other.length > 0 && (
        <>
          <h2 className="font-heading text-lg font-semibold text-on-surface mt-2">Suggested for you</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {other.map((c) => (
              <article key={c.id} className="rounded-[10px] bg-surface border border-border p-5 flex flex-col gap-3">
                <span className="text-3xl">{c.cover}</span>
                <h3 className="font-heading text-[17px] font-semibold text-on-surface">{c.name}</h3>
                <p className="text-sm text-on-surface-muted flex-1">{c.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="flex items-center gap-1 text-xs text-on-surface-muted"><Users className="size-4" />{c.members.toLocaleString()}</span>
                  <Button size="sm" onClick={() => toggleCommunity(c.id)}>Join</Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
