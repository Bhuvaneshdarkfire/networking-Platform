import { Hash, Image, Send, Video, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { Avatar } from '../ui/primitives'

export function PostComposer({ communityId }: { communityId?: string }) {
  const { member, createPost } = useApp()
  const [body, setBody] = useState('')
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' }>()
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const chooseMedia = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError('')
    if (!file) return
    if (file.size > 1_500_000) { setError('For this demo, choose a file under 1.5 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => setMedia({ url: String(reader.result), type: file.type.startsWith('video/') ? 'video' : 'image' })
    reader.readAsDataURL(file)
  }

  const publish = () => {
    if (!body.trim() && !media) return
    createPost({ body: body.trim(), communityId, mediaUrl: media?.url, mediaType: media?.type })
    setBody(''); setMedia(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="rounded-[10px] bg-surface border border-border p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Avatar label={member.avatar} className="size-10" />
        <label className="flex-1">
          <span className="sr-only">Share an idea or ask the community</span>
          <textarea rows={2} placeholder="Share an idea or ask the community..." value={body} onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-[8px] border border-border bg-surface-subtle px-4 py-2 text-[15px] text-on-surface placeholder:text-on-surface-subtle focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary-tint focus:outline-none resize-none transition-colors" />
        </label>
      </div>
      {media && (
        <div className="relative overflow-hidden rounded-[8px] bg-surface-subtle">
          {media.type === 'image' ? <img src={media.url} alt="Preview" className="max-h-80 w-full object-cover" /> : <video src={media.url} controls className="max-h-80 w-full" />}
          <button onClick={() => setMedia(undefined)} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-on-background/70 text-on-primary" aria-label="Remove"><X className="size-4" /></button>
        </div>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <input ref={inputRef} className="hidden" type="file" accept="image/*,video/*" onChange={chooseMedia} />
          <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-on-surface-muted hover:bg-surface-subtle text-xs font-medium transition-colors">
            <Image className="size-4" /> <span className="hidden sm:inline">Image</span>
          </button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-on-surface-muted hover:bg-surface-subtle text-xs font-medium transition-colors">
            <Video className="size-4" /> <span className="hidden sm:inline">Video</span>
          </button>
          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-on-surface-muted hover:bg-surface-subtle text-xs font-medium transition-colors">
            <Hash className="size-4" /> <span className="hidden sm:inline">Tag</span>
          </button>
        </div>
        <button onClick={publish} disabled={!body.trim() && !media} className="px-4 py-1.5 rounded-[8px] bg-primary hover:bg-primary-hover text-on-primary text-sm font-medium transition-colors disabled:opacity-50">Post</button>
      </div>
    </section>
  )
}
