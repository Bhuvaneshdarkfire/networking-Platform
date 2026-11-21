
import { Image, Send, X } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useApp } from '../../context/AppContext'
import { uploadPostMedia } from '../../services/storage.service'
import { Button } from '../ui/button'
import { Avatar, Card, fieldClass } from '../ui/primitives'

export function PostComposer({ communityId }: { communityId?: string }) {
  const { member, createPost } = useApp()
  const [body, setBody] = useState('')
  const [media, setMedia] = useState<{
    url: string
    type: 'image' | 'video'
    file: File
  }>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const chooseMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError('')

    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Choose a file under 10 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setMedia({
        url: String(reader.result),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        file,
      })
    }

    reader.onerror = () => setError('Unable to read this file.')

    reader.readAsDataURL(file)
  }

  const publish = async () => {
    if (!body.trim() && !media) return

    try {
      setLoading(true)
      setError('')

      let mediaUrl: string | undefined

      if (media) {
        mediaUrl = await uploadPostMedia(media.file)
      }

      await createPost({
        body: body.trim(),
        communityId,
        mediaUrl,
        mediaType: media?.type,
      })

      setBody('')
      setMedia(undefined)

      if (inputRef.current) inputRef.current.value = ''
    } catch (error) {
      console.error('Post creation failed:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to publish post. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex gap-3">
        <Avatar label={member.avatar} />
        <textarea
          className={`${fieldClass} min-h-24 resize-none`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={
            communityId
              ? 'Share something with this community…'
              : 'Share an update with your community…'
          }
          disabled={loading}
        />
      </div>

      {media && (
        <div className="relative mt-4 overflow-hidden rounded-xl bg-slate-100">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt="Upload preview"
              className="max-h-80 w-full object-cover"
            />
          ) : (
            <video src={media.url} controls className="max-h-80 w-full" />
          )}

          <button
            onClick={() => setMedia(undefined)}
            disabled={loading}
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-slate-950/70 text-white"
            aria-label="Remove media"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-between">
        <div>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/*,video/*"
            onChange={chooseMedia}
          />
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            <Image className="size-4" />
            Add media
          </Button>
        </div>

        <Button
          size="sm"
          onClick={publish}
          disabled={loading || (!body.trim() && !media)}
        >
          <Send className="size-4" />
          {loading ? 'Uploading...' : 'Post'}
        </Button>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Images and videos are uploaded to Supabase Storage.
      </p>
    </Card>
  )
}
