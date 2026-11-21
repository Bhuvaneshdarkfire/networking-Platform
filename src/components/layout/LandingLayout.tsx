import { ArrowRight, CalendarDays, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { Badge, Card } from '../ui/primitives'

export function LandingLayout() {
  const { communities, member } = useApp()
  const joined = communities.filter((community) => community.joined)

  return <div className="space-y-8">
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 to-cyan-700 px-6 py-10 text-white sm:px-10">
      <Badge className="mb-4 bg-white/15 text-white"><Sparkles className="mr-1 size-3" /> Your community, connected</Badge>
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Welcome back, {member.name.split(' ')[0]}.</h1>
      <p className="mt-4 max-w-xl text-teal-50">Find your people, share what matters, and turn local ideas into meaningful action.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link to="/feed"><Button className="bg-white text-teal-800 hover:bg-teal-50">Explore your feed <ArrowRight className="size-4" /></Button></Link>
        <Link to="/discover"><Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">Discover communities</Button></Link>
      </div>
    </section>
    <section>
      <div className="mb-4 flex items-end justify-between"><div><p className="text-sm font-semibold text-teal-700">YOUR SPACES</p><h2 className="text-2xl font-bold text-slate-950">Communities you belong to</h2></div><Link to="/discover" className="text-sm font-semibold text-teal-700">View all</Link></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {joined.map((community) => <Link key={community.id} to={`/communities/${community.id}`}><Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="mb-4 text-4xl">{community.cover}</div><h3 className="font-bold text-slate-950">{community.name}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-600">{community.description}</p><div className="mt-4 flex items-center gap-4 text-xs text-slate-500"><span className="flex items-center gap-1"><Users className="size-3.5" />{community.members.toLocaleString()}</span><span className="flex items-center gap-1"><CalendarDays className="size-3.5" />Active today</span></div></Card></Link>)}
      </div>
    </section>
  </div>
}
