import {
  AlertCircle,
  Check,
  Heart,
  MessageCircle,
  Send,
  Share2,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import type { FeedComment, FeedPost } from '../../types/feed'
import { Button } from '../ui/button'
import { Avatar, Card, fieldClass } from '../ui/primitives'
import { isVideoUrl } from './mediaUtils'

// oxlint-disable-next-line react/only-export-components
export { isVideoUrl }

export interface FeedCardProps {
  post: FeedPost
  className?: string
  onLike?: (postId: string) => void
  onComment?: (postId: string, comment: string) => void
  onShare?: (post: FeedPost) => void
}

export function FeedCard({
  post,
  className,
  onLike,
  onComment,
  onShare,
}: FeedCardProps) {
  // Gracefully consume AppContext if available
  let appState: ReturnType<typeof useApp> | null = null
  try {
    // oxlint-disable-next-line react/rules-of-hooks -- fallback wrapper for robust standalone usage
    appState = useApp()
  } catch {
    appState = null
  }

  const postId = post.id || 'temp-id'

  // Extract content supporting various field formats (text, content, body)
  const postText = post.text ?? post.content ?? post.body ?? ''

  // Extract author info supporting Member object or flat fields
  const authorName =
    typeof post.author === 'object' && post.author?.name
      ? post.author.name
      : post.author_name || 'Community Member'

  const authorHandle =
    typeof post.author === 'object' && post.author?.handle
      ? post.author.handle
      : post.author_handle ||
        `@${authorName.toLowerCase().replace(/\s+/g, '')}`

  const authorAvatar =
    typeof post.author === 'object' && post.author?.avatar
      ? post.author.avatar
      : post.author_avatar || authorName.charAt(0).toUpperCase()

  // Extract media URL and type
  const mediaUrl = post.media_url ?? post.mediaUrl ?? null
  const explicitMediaType = post.media_type ?? post.mediaType ?? null

  // Extract community details
  const communityId = post.community_id ?? post.communityId
  const community =
    appState?.communities.find((item) => item.id === communityId) || null
  const communityName = post.community_name || community?.name

  // Extract timestamp
  const timestamp = post.created_at ?? post.createdAt ?? 'Just now'

  // Local state for interaction and error handling
  const [mediaError, setMediaError] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  // Local like state for immediate feedback
  const [liked, setLiked] = useState<boolean>(Boolean(post.liked))
  const [likesCount, setLikesCount] = useState<number>(post.likes ?? 0)

  // Local comments list fallback
  const [comments, setComments] = useState<FeedComment[]>(post.comments ?? [])

  const isVideo = isVideoUrl(mediaUrl, explicitMediaType)

  const handleLike = () => {
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikesCount((prev) => prev + (nextLiked ? 1 : -1))

    if (onLike) {
      onLike(postId)
    } else if (appState?.toggleLike && post.id) {
      appState.toggleLike(post.id)
    }
  }

  const handleCommentSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = commentInput.trim()
    if (!trimmed) return

    const newComment: FeedComment = {
      id: crypto.randomUUID(),
      author: appState?.member || {
        id: 'current-user',
        name: 'You',
        handle: '@you',
        avatar: 'Y',
        bio: '',
        location: '',
        interests: [],
      },
      body: trimmed,
      createdAt: 'Just now',
    }

    setComments((prev) => [...prev, newComment])
    setCommentInput('')
    setCommentsOpen(true)

    if (onComment) {
      onComment(postId, trimmed)
    } else if (appState?.addComment && post.id) {
      appState.addComment(post.id, trimmed)
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare(post)
      return
    }

    const shareUrl = `${window.location.origin}/feed#${postId}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
    }
  }

  return (
    <Card className={cn('overflow-hidden transition-all duration-150 hover:border-slate-300', className)}>
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Avatar label={authorAvatar} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-950 hover:text-teal-700">
              {authorName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {authorHandle} · {timestamp}
              {communityId && communityName && (
                <>
                  {' '}
                  ·{' '}
                  <Link
                    to={`/communities/${communityId}`}
                    className="font-medium text-teal-700 hover:underline"
                  >
                    {communityName}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Post Text */}
        {postText && (
          <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-6 text-slate-700">
            {postText}
          </p>
        )}
      </div>

      {/* Media Rendering with Clean Fallback */}
      {mediaUrl && (
        <div className="relative border-y border-slate-100 bg-slate-100">
          {mediaError ? (
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              <AlertCircle className="size-4 shrink-0 text-slate-400" />
              <span>Media could not be loaded.</span>
            </div>
          ) : isVideo ? (
            <video
              src={mediaUrl}
              controls
              className="max-h-[520px] w-full bg-slate-950 object-contain"
              preload="metadata"
              onError={() => setMediaError(true)}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={postText ? postText.slice(0, 50) : 'Post media'}
              className="max-h-[520px] w-full object-cover"
              loading="lazy"
              onError={() => setMediaError(true)}
            />
          )}
        </div>
      )}

      {/* Interaction Footer */}
      <div className="flex items-center border-t border-slate-100 px-3 py-2 text-slate-600">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 gap-1.5 transition-colors',
            liked ? 'text-rose-600 hover:text-rose-700' : 'hover:text-slate-900',
          )}
          onClick={handleLike}
        >
          <Heart className={cn('size-4', liked && 'fill-current text-rose-600')} />
          <span>{likesCount}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 hover:text-slate-900"
          onClick={() => setCommentsOpen((open) => !open)}
        >
          <MessageCircle className="size-4" />
          <span>{comments.length}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 hover:text-slate-900"
          onClick={handleShare}
        >
          {isCopied ? (
            <>
              <Check className="size-4 text-emerald-600" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="size-4" />
              <span>Share</span>
            </>
          )}
        </Button>
      </div>

      {/* Expandable Comments Drawer */}
      {(commentsOpen || comments.length > 0) && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/75 p-4">
          {comments.map((commentItem) => {
            const commentAuthorName =
              typeof commentItem.author === 'object'
                ? commentItem.author.name
                : 'Member'
            const commentAuthorAvatar =
              typeof commentItem.author === 'object'
                ? commentItem.author.avatar
                : 'M'

            return (
              <div key={commentItem.id} className="flex items-start gap-2.5">
                <Avatar
                  label={commentAuthorAvatar || 'M'}
                  className="size-7 text-xs"
                />
                <div className="min-w-0 flex-1 rounded-2xl bg-white px-3.5 py-2.5 text-sm shadow-xs border border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">
                      {commentAuthorName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {commentItem.createdAt}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-slate-700">
                    {commentItem.body}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Comment input form */}
          <form className="mt-3 flex gap-2" onSubmit={handleCommentSubmit}>
            <input
              className={fieldClass}
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              placeholder="Write a supportive comment…"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!commentInput.trim()}
              aria-label="Send comment"
              className="bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </Card>
  )
}
