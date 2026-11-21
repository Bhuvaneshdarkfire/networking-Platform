import { Heart, MessageCircle, Send, Share2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import type { Post } from '../../lib/types'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Avatar, Card, fieldClass } from '../ui/primitives'
import { isVideoUrl } from './mediaUtils'

export function PostCard({ post }: { post: Post }) {
  const { communities, toggleLike, addComment } = useApp()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comment, setComment] = useState('')
  const community = communities.find((item) => item.id === post.communityId)

  const submitComment = (event: FormEvent) => {
    event.preventDefault()
    if (!comment.trim()) return
    addComment(post.id, comment.trim())
    setComment('')
    setCommentsOpen(true)
  }

  return <Card className="overflow-hidden">
    <div className="p-4 sm:p-5">
      <div className="flex gap-3"><Avatar label={post.author.avatar} src={post.author.avatarUrl} /><div className="min-w-0"><p className="font-bold text-slate-950">{post.author.name}</p><p className="truncate text-xs text-slate-500">{post.author.handle} · {post.createdAt}{community && <> · <Link className="font-medium text-teal-700" to={`/communities/${community.id}`}>{community.name}</Link></>}</p></div></div>
      {post.body && <p className="mt-4 whitespace-pre-wrap text-[15px] leading-6 text-slate-700">{post.body}</p>}
    </div>
    {post.mediaUrl && (isVideoUrl(post.mediaUrl, post.mediaType) ? <video src={post.mediaUrl} controls preload="metadata" className="max-h-[520px] w-full bg-slate-950" /> : <img src={post.mediaUrl} alt="Post media" loading="lazy" className="max-h-[520px] w-full object-cover" />)}
    <div className="flex border-t border-slate-100 px-3 py-2">
      <Button variant="ghost" size="sm" className={cn('flex-1', post.liked && 'text-rose-600')} onClick={() => toggleLike(post.id)}><Heart className={cn('size-4', post.liked && 'fill-current')} />{post.likes}</Button>
      <Button variant="ghost" size="sm" className="flex-1" onClick={() => setCommentsOpen((open) => !open)}><MessageCircle className="size-4" />{post.comments.length}</Button>
      <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigator.clipboard?.writeText(`${location.origin}/feed#${post.id}`)}><Share2 className="size-4" />Share</Button>
    </div>
    {(commentsOpen || post.comments.length > 0) && <div className="space-y-3 border-t border-slate-100 bg-slate-50 p-4">
      {post.comments.map((item) => <div key={item.id} className="flex gap-2"><Avatar label={item.author.avatar} src={item.author.avatarUrl} className="size-8 text-xs" /><div className="rounded-xl bg-white px-3 py-2 text-sm"><span className="font-bold text-slate-900">{item.author.name}</span><p className="text-slate-600">{item.body}</p></div></div>)}
      <form className="flex gap-2" onSubmit={submitComment}><input className={fieldClass} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment…" /><Button size="icon" aria-label="Send comment"><Send className="size-4" /></Button></form>
    </div>}
  </Card>
}
