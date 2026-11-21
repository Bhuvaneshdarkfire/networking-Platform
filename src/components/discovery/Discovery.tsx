import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/primitives'
import { Button } from '../ui/button'

const tabs = ['People you may know', 'Communities', 'Requests (2)'] as const
const topicFilters = ['All topics', '#React', '#Startup', '#DesignSystems', '#AI']

export function Discovery() {
  const { people, toggleConnection } = useApp()
  const [activeTab, setActiveTab] = useState(0)
  const [activeTopic, setActiveTopic] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-[26px] font-semibold leading-[34px] tracking-tight text-on-surface">Discover People</h1>
          <p className="text-[15px] text-on-surface-muted">Meet builders, designers, and founders who share your communities and curiosity.</p>
        </div>
        <p className="text-sm text-on-surface-muted tabular-nums shrink-0">128 connections</p>
      </header>

      {/* Tabs */}
      <div className="flex flex-col gap-4">
        <div role="tablist" className="flex items-center gap-4 sm:gap-6 border-b border-border">
          {tabs.map((tab, i) => (
            <button key={tab} role="tab" aria-selected={i === activeTab} onClick={() => setActiveTab(i)}
              className={cn('pb-3 border-b-2 -mb-px text-sm font-medium transition-colors',
                i === activeTab ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface'
              )}>{tab}</button>
          ))}
        </div>

        {/* Topic Filters */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by topic">
          {topicFilters.map((topic, i) => (
            <button key={topic} onClick={() => setActiveTopic(i)}
              className={cn('inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-medium transition-colors',
                i === activeTopic ? 'bg-primary text-on-primary'
                  : i === 1 ? 'bg-primary-tint text-on-primary-tint hover:bg-primary hover:text-on-primary'
                  : i === 3 ? 'bg-terracotta-tint text-on-terracotta-tint hover:bg-terracotta hover:text-on-terracotta'
                  : 'bg-surface-subtle text-on-surface-muted hover:text-on-surface'
              )}>{topic}</button>
          ))}
        </div>
      </div>

      {/* People Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {people.map((person) => (
          <article key={person.id} className="h-full rounded-[10px] bg-surface border border-border p-6 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar label={person.avatar} className="size-12" />
                <div>
                  <h2 className="font-heading text-[17px] font-semibold text-on-surface">{person.name}</h2>
                  <p className="text-sm text-on-surface-muted">{person.title} · {person.location}</p>
                </div>
              </div>
              <p className="text-[15px] leading-6 text-on-surface">{person.bio}</p>
              {person.currentlyBuilding && (
                <p className="text-[12px] font-medium text-on-primary-tint bg-primary-tint px-2.5 py-1 rounded-[8px] self-start">
                  Currently building: {person.currentlyBuilding}
                </p>
              )}
              {person.openTo && (
                <p className="text-[12px] font-medium text-on-terracotta-tint bg-terracotta-tint px-2.5 py-1 rounded-[8px] self-start">
                  Open to {person.openTo}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {person.interests.map((tag, i) => (
                  <span key={tag} className={cn(
                    'px-2 py-0.5 rounded-[8px] text-[12px] font-medium',
                    i === 0 ? 'bg-primary-tint text-on-primary-tint' : 'bg-surface-subtle text-on-surface-muted'
                  )}>#{tag}</span>
                ))}
              </div>
            </div>
            <footer className="flex items-center justify-between gap-2 pt-3 border-t border-border">
              <span className="text-[12px] text-on-surface-muted tabular-nums">{person.mutualConnections} mutual connections</span>
              <Button size="sm" onClick={() => toggleConnection(person.id)}
                variant={person.connectionStatus === 'pending' ? 'terracotta' : 'default'}>
                {person.connectionStatus === 'pending' ? 'Pending' : person.connectionStatus === 'connected' ? 'Connected' : 'Connect'}
              </Button>
            </footer>
          </article>
        ))}
      </section>
    </div>
  )
}
