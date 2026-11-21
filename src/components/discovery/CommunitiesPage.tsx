import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { Card } from '../ui/primitives'
import { CommunityCard } from './CommunityCard'

export function CommunitiesPage() {
  const { communities } = useApp()
  return <div className="mx-auto max-w-6xl space-y-6"><header className="flex items-end justify-between gap-4"><div><h1 className="font-heading text-3xl font-semibold">Communities</h1><p className="mt-1 text-sm text-[#6F675E]">Join a space or start one around what matters to you.</p></div><Link to="/communities/create"><Button><Plus className="size-4" />Create community</Button></Link></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{communities.map((community) => <CommunityCard key={community.id} community={community} />)}{communities.length === 0 && <Card className="col-span-full p-12 text-center text-[#6F675E]">No communities yet. Create the first one.</Card>}</div></div>
}
