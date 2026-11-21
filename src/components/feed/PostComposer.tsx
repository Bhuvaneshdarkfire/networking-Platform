import { Image, LoaderCircle, Send, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { Avatar, Card, fieldClass } from '../ui/primitives'

export function PostComposer({ communityId }: { communityId?: string }) {
  const { member, createPost } = useApp()
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const chooseMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]; setError('')
    if (!selected) return
    if (selected.size > 10 * 1024 * 1024) { setError('Choose a media file under 10 MB.'); return }
    if (preview) URL.revokeObjectURL(preview)
    setFile(selected); setPreview(URL.createObjectURL(selected))
  }
  const removeMedia = () => { if (preview) URL.revokeObjectURL(preview); setFile(undefined); setPreview(''); if (inputRef.current) inputRef.current.value = '' }
  const publish = async () => {
    if (!body.trim() && !file) return
    setBusy(true); setError('')
    try { await createPost({ body: body.trim(), communityId, file }); setBody(''); removeMedia() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Post could not be published') }
    finally { setBusy(false) }
  }

  return <Card className="p-4 sm:p-5"><div className="flex gap-3"><Avatar label={member?.avatar ?? 'U'} src={member?.avatarUrl} /><textarea className={`${fieldClass} min-h-24 resize-none`} value={body} onChange={(event) => setBody(event.target.value)} placeholder={communityId ? 'Share something with this community…' : 'Share an update with your network…'} /></div>
    {preview && <div className="relative mt-4 overflow-hidden rounded-lg bg-[#F3EFE8]">{file?.type.startsWith('video/') ? <video src={preview} controls className="max-h-80 w-full" /> : <img src={preview} alt="Upload preview" className="max-h-80 w-full object-cover" />}<button onClick={removeMedia} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/65 text-white" aria-label="Remove media"><X className="size-4" /></button></div>}
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}<div className="mt-4 flex items-center justify-between"><div><input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={chooseMedia} /><Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}><Image className="size-4" />Add media</Button></div><Button size="sm" onClick={() => void publish()} disabled={busy || (!body.trim() && !file)}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}Post</Button></div>
  </Card>
}
