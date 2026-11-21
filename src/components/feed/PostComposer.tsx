import { Image, LoaderCircle, Send, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'
import { Avatar, Card, fieldClass } from '../ui/primitives'

export function PostComposer({ communityId, onCreated }: { communityId?: string; onCreated?: () => void }) {
  const { member, createPost } = useApp()
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File>()
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

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
    try { await createPost({ body: body.trim(), communityId, file }); setBody(''); removeMedia(); onCreated?.() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Post could not be published') }
    finally { setBusy(false) }
  }

  return <Card className="p-4 sm:p-5"><div className="flex items-center gap-3 border-b border-[#E7E0D6] pb-4"><Avatar label={member?.avatar ?? 'U'} src={member?.avatarUrl} /><div><p className="font-semibold">Create a post</p><p className="text-xs text-[#6F675E]">Share an update with your network</p></div></div>
    <label className="mt-4 block text-sm font-semibold">Text content<textarea className={`${fieldClass} mt-2 min-h-28 resize-none`} value={body} onChange={(event) => setBody(event.target.value)} placeholder={communityId ? 'Share something with this community…' : 'What would you like to share?'} /></label>
    <div className="mt-4"><p className="text-sm font-semibold">Media content <span className="font-normal text-[#8A8178]">(optional)</span></p><input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={chooseMedia} />{preview ? <div className="relative mt-2 overflow-hidden rounded-lg bg-[#F3EFE8]">{file?.type.startsWith('video/') ? <video src={preview} controls className="max-h-80 w-full" /> : <img src={preview} alt="Upload preview" className="max-h-80 w-full object-cover" />}<button onClick={removeMedia} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/65 text-white" aria-label="Remove media"><X className="size-4" /></button></div> : <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 flex w-full flex-col items-center rounded-lg border border-dashed border-[#D5CCC0] bg-[#FAF7F2] px-4 py-7 text-sm text-[#6F675E] hover:border-[#2F6B4F] hover:bg-[#E4F0E9]"><Image className="mb-2 size-6" /><span className="font-semibold text-[#2F6B4F]">Choose an image or video</span><span className="mt-1 text-xs">JPEG, PNG, WebP, GIF, MP4 or WebM · up to 10 MB</span></button>}</div>
    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}<div className="mt-5 flex items-center justify-end gap-2 border-t border-[#E7E0D6] pt-4">{file && <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>Change media</Button>}<Button size="sm" onClick={() => void publish()} disabled={busy || (!body.trim() && !file)}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}Publish post</Button></div>
  </Card>
}
