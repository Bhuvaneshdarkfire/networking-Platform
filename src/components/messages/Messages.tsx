import { useApp } from '../../context/AppContext'
import { Avatar } from '../ui/primitives'
import { cn } from '../../lib/utils'

export function Messages() {
  const { conversations } = useApp()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[26px] font-semibold leading-[34px] tracking-tight text-on-surface">Messages</h1>
        <button className="px-4 py-2 rounded-[8px] bg-primary hover:bg-primary-hover text-on-primary text-sm font-medium transition-colors">New message</button>
      </div>

      <div className="rounded-[10px] bg-surface border border-border divide-y divide-border">
        {conversations.map((conv) => (
          <button key={conv.id} className={cn(
            'w-full flex items-center gap-3 p-4 text-left hover:bg-surface-subtle transition-colors',
            conv.unread && 'bg-primary-tint/30'
          )}>
            <Avatar label={conv.person.avatar} className="size-11" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={cn('text-sm truncate', conv.unread ? 'font-semibold text-on-surface' : 'font-medium text-on-surface')}>{conv.person.name}</span>
                <span className="text-xs text-on-surface-muted shrink-0">{conv.time}</span>
              </div>
              <p className={cn('text-sm truncate', conv.unread ? 'text-on-surface font-medium' : 'text-on-surface-muted')}>{conv.lastMessage}</p>
            </div>
            {conv.unread && <span className="size-2 rounded-full bg-primary shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  )
}
