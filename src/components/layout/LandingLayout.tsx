import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { Card } from '../ui/primitives'
import { Users, CalendarDays } from 'lucide-react'

export function LandingLayout() {
  const { communities, member } = useApp()
  const joined = communities.filter((c) => c.joined)

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-[10px] bg-gradient-to-br from-primary to-primary-hover px-6 py-10 text-on-primary sm:px-10">
        <span className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white mb-4">
          <Sparkles className="mr-1 size-3" /> Your community, connected
        </span>
        <h1 className="max-w-2xl font-heading text-3xl font-bold tracking-tight sm:text-5xl">Welcome back, {member.name.split(' ')[0]}.</h1>
        <p className="mt-4 max-w-xl text-on-primary/80">Find your people, share what matters, and turn ideas into meaningful action.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/feed"><Button className="bg-white text-primary hover:bg-primary-tint">Explore your feed <ArrowRight className="size-4" /></Button></Link>
          <Link to="/discover"><Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">Discover people</Button></Link>
        </div>
      </section>

      {/* Joined Communities */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Your Spaces</p>
            <h2 className="font-heading text-2xl font-bold text-on-surface">Communities you belong to</h2>
          </div>
          <Link to="/communities" className="text-sm font-semibold text-primary">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {joined.map((c) => (
            <Link key={c.id} to={`/communities/${c.id}`}>
              <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-4 text-4xl">{c.cover}</div>
                <h3 className="font-bold text-on-surface">{c.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-on-surface-muted">{c.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-on-surface-muted">
                  <span className="flex items-center gap-1"><Users className="size-3.5" />{c.members.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />Active today</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
