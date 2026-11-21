import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'
import type { Post } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/primitives'

export function PostCard({ post }: { post: Post }) {
  const { toggleLike, addComment, member } = useApp()
  const [commentsOpen, setCommentsOpen] = useState(post.comments.length > 0)
  const [comment, setComment] = useState('')

  const submitComment = (e: FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    addComment(post.id, comment.trim())
    setComment('')
    setCommentsOpen(true)
  }

  return (
    <article className="rounded-[10px] bg-surface border border-border p-4 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-start gap-3">
        <Avatar label={post.author.avatar} className="size-11" />
        <div className="flex flex-col">
          <div className="flex flex-wrap items-baseline gap-1">
            <h2 className="font-heading text-[17px] font-semibold text-on-surface">{post.author.name}</h2>
            {post.communityName && (
              <span className="text-[12px] font-medium text-on-primary-tint bg-primary-tint px-2 py-0.5 rounded-[8px]">in {post.communityName}</span>
            )}
          </div>
          <p className="text-[12px] text-on-surface-muted">{post.author.title} · {post.createdAt}</p>
        </div>
      </header>

      {/* Body */}
      <p className="text-[15px] leading-6 text-on-surface">{post.body}</p>

      {/* Media */}
      {post.mediaUrl && (
        <figure className="overflow-hidden rounded-[8px] border border-border">
          {post.mediaType === 'video'
            ? <video src={post.mediaUrl} controls className="max-h-[400px] w-full bg-on-background" />
            : <img src={post.mediaUrl} alt="Post media" className="w-full h-64 object-cover" />
          }
        </figure>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.map((tag, i) => (
            <span key={tag} className={cn(
              'px-2 py-0.5 rounded-[8px] text-[12px] font-medium',
              i === 0 ? 'bg-primary-tint text-on-primary-tint' : 'bg-surface-subtle text-on-surface-muted'
            )}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <footer className="flex items-center justify-between gap-2 pt-2 border-t border-border text-on-surface-muted">
        <div className="flex items-center gap-4">
          <button onClick={() => toggleLike(post.id)} className={cn('inline-flex items-center gap-1 hover:text-primary text-xs font-medium transition-colors', post.liked && 'text-primary')}>
            <Heart className={cn('size-4', post.liked && 'fill-current')} />
            <span className="tabular-nums">{post.likes}</span>
          </button>
          <button onClick={() => setCommentsOpen(!commentsOpen)} className="inline-flex items-center gap-1 hover:text-on-surface text-xs font-medium transition-colors">
            <MessageCircle className="size-4" />
            <span className="tabular-nums">{post.comments.length}</span>
          </button>
          <button className="inline-flex items-center gap-1 hover:text-on-surface text-xs font-medium transition-colors">
            <Share2 className="size-4" />
            <span className="tabular-nums">{post.shares ?? 0}</span>
          </button>
        </div>
        <button className="inline-flex items-center gap-1 hover:text-primary text-xs font-medium transition-colors">
          <Bookmark className="size-4" />
          <span className="tabular-nums">{post.saves ?? 0}</span>
        </button>
      </footer>

      {/* Comments */}
      {commentsOpen && (
        <section className="pt-2 border-t border-border flex flex-col gap-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar label={c.author.avatar} className="size-7 text-[10px] mt-0.5" />
              <div className="flex-1 rounded-[8px] bg-surface-subtle px-3 py-2 flex flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-on-surface">{c.author.name}</span>
                  <span className="text-[11px] text-on-surface-muted">{c.createdAt}</span>
                </div>
                <p className="text-sm text-on-surface">{c.body}</p>
              </div>
            </div>
          ))}
          <form className="flex gap-2" onSubmit={submitComment}>
            <Avatar label={member.avatar} className="size-7 text-[10px] mt-0.5" />
            <input className="flex-1 rounded-[8px] border border-border bg-surface-subtle px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-subtle focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary-tint focus:outline-none transition-colors"
              value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment…" />
            <button type="submit" className="px-3 py-2 rounded-[8px] bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium transition-colors" disabled={!comment.trim()}>Send</button>
          </form>
        </section>
      )}
    </article>
  )
}
