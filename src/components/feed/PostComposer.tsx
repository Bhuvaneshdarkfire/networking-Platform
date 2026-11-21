import { Image, Send, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { Avatar, Card, fieldClass } from '../ui/primitives'

export function PostComposer({ communityId }: { communityId?: string }) {
  const { member, createPost } = useApp()
  const [body, setBody] = useState('')
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' }>()
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const chooseMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError('')
    if (!file) return
    if (file.size > 1_500_000) {
      setError('For this browser-only demo, choose a file under 1.5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setMedia({ url: String(reader.result), type: file.type.startsWith('video/') ? 'video' : 'image' })
    reader.readAsDataURL(file)
  }

  const publish = () => {
    if (!body.trim() && !media) return
    createPost({ body: body.trim(), communityId, mediaUrl: media?.url, mediaType: media?.type })
    setBody('')
    setMedia(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  return <Card className="p-4 sm:p-5">
    <div className="flex gap-3"><Avatar label={member.avatar} /><textarea className={`${fieldClass} min-h-24 resize-none`} value={body} onChange={(event) => setBody(event.target.value)} placeholder={communityId ? 'Share something with this community…' : 'Share an update with your community…'} /></div>
    {media && <div className="relative mt-4 overflow-hidden rounded-xl bg-slate-100">{media.type === 'image' ? <img src={media.url} alt="Upload preview" className="max-h-80 w-full object-cover" /> : <video src={media.url} controls className="max-h-80 w-full" />}<button onClick={() => setMedia(undefined)} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-slate-950/70 text-white" aria-label="Remove media"><X className="size-4" /></button></div>}
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    <div className="mt-4 flex items-center justify-between">
      <div><input ref={inputRef} className="hidden" type="file" accept="image/*,video/*" onChange={chooseMedia} /><Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}><Image className="size-4" /> Add media</Button></div>
      <Button size="sm" onClick={publish} disabled={!body.trim() && !media}><Send className="size-4" /> Post</Button>
    </div>
    <p className="mt-2 text-xs text-slate-400">Prototype mode: media stays in this browser until backend storage is connected.</p>
  </Card>
}
