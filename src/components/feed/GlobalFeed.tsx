import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'

const tabs = ['For you', 'Following', 'Communities'] as const

export function GlobalFeed() {
  const { posts } = useApp()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Tabs */}
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-[26px] font-semibold leading-[34px] tracking-tight text-on-surface">Global Feed</h1>
        <div role="tablist" className="flex items-center gap-6 border-b border-border">
          {tabs.map((tab, i) => (
            <button key={tab} role="tab" aria-selected={i === activeTab} onClick={() => setActiveTab(i)}
              className={cn('pb-3 border-b-2 -mb-px text-sm font-medium transition-colors',
                i === activeTab ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface'
              )}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <PostComposer />

      {/* Posts */}
      <div className="flex flex-col gap-4">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  )
}
