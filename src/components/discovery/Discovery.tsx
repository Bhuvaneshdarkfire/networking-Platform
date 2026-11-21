import { Search } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { fieldClass } from '../ui/primitives'
import { CommunityCard } from './CommunityCard'

export function Discovery() {
  const { communities } = useApp()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', ...new Set(communities.map((item) => item.category))]
  const results = communities.filter((item) => (category === 'All' || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()))

  return <div className="space-y-6">
    <div><p className="text-sm font-semibold text-teal-700">FIND YOUR PEOPLE</p><h1 className="text-3xl font-bold text-slate-950">Discover communities</h1><p className="mt-2 text-slate-600">Explore spaces built around shared interests and local action.</p></div>
    <div className="relative max-w-xl"><Search className="absolute left-3 top-3 size-5 text-slate-400" /><input className={`${fieldClass} pl-10`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search communities" /></div>
    <div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-medium ${category === item ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{item}</button>)}</div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{results.map((community) => <CommunityCard key={community.id} community={community} />)}</div>
    {results.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">No communities match your search.</div>}
  </div>
}
