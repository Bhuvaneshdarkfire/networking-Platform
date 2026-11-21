import { AlertCircle, Film, Image as ImageIcon, Loader2, Send, X } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import type { CreatePostPayload } from '../../types/feed'
import { Button } from '../ui/button'
import { Avatar, Card } from '../ui/primitives'

// Dynamically inspect if Team Member A's Supabase hook is available
const supabaseDataModules = import.meta.glob<Record<string, any>>(
  '/src/hooks/useSupabaseData.{ts,tsx,js,jsx}',
  { eager: true },
)

export interface CreatePostProps {
  communityId?: string
  onPostCreated?: (post: CreatePostPayload) => void
  placeholder?: string
  className?: string
}

export function CreatePost({
  communityId,
  onPostCreated,
  placeholder,
  className,
}: CreatePostProps) {
  // AppContext is provided globally; handle gracefully if used standalone
  let appState: ReturnType<typeof useApp> | null = null
  try {
    // oxlint-disable-next-line react/rules-of-hooks -- fallback wrapper for robust standalone usage
    appState = useApp()
  } catch {
    appState = null
  }

  const member = appState?.member
  const appCreatePost = appState?.createPost

  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'image' | 'video'>('image')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up Object URL when preview changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selected = event.target.files?.[0]
    if (!selected) return

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const isVideo = selected.type.startsWith('video/')
    const isImage = selected.type.startsWith('image/')

    if (!isImage && !isVideo) {
      setError('Please select an image or video file.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Limit client-side selection to reasonable size (100MB max)
    if (selected.size > 100 * 1024 * 1024) {
      setError('File size exceeds the 100MB limit.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setFile(selected)
    setFileType(isVideo ? 'video' : 'image')
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleClearMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadToCloudinary = async (
    mediaFile: File,
  ): Promise<{ url: string; type: 'image' | 'video' }> => {
    const cloudName = (
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
      (import.meta.env as Record<string, string | undefined>)
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      ''
    ).trim()

    const uploadPreset = (
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
      (import.meta.env as Record<string, string | undefined>)
        .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      ''
    ).trim()

    if (!cloudName || !uploadPreset) {
      throw new Error(
        'Cloudinary credentials missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.',
      )
    }

    const formData = new FormData()
    formData.append('file', mediaFile)
    formData.append('upload_preset', uploadPreset)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      },
    )

    if (!response.ok) {
      let errorMessage = `Upload failed (${response.status} ${response.statusText})`
      try {
        const errorJson = await response.json()
        if (errorJson?.error?.message) {
          errorMessage = errorJson.error.message
        }
      } catch {
        // Fall back to default message
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const mediaUrl: string = data.secure_url || data.url
    const mediaType: 'image' | 'video' =
      data.resource_type === 'video' ? 'video' : 'image'

    return { url: mediaUrl, type: mediaType }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const trimmedBody = body.trim()
    if (!trimmedBody && !file) {
      setError('Please write something or attach media to share.')
      return
    }

    let uploadedMediaUrl: string | null = null
    let uploadedMediaType: 'image' | 'video' | null = null

    try {
      if (file) {
        setIsUploading(true)
        const uploadResult = await uploadToCloudinary(file)
        uploadedMediaUrl = uploadResult.url
        uploadedMediaType = uploadResult.type
        setIsUploading(false)
      }

      setIsSubmitting(true)

      const postPayload: CreatePostPayload = {
        id: crypto.randomUUID(),
        text: trimmedBody,
        content: trimmedBody,
        body: trimmedBody,
        media_url: uploadedMediaUrl,
        mediaUrl: uploadedMediaUrl,
        media_type: uploadedMediaType,
        mediaType: uploadedMediaType,
        community_id: communityId || null,
        communityId: communityId || undefined,
        author_name: member?.name || 'Community Member',
        author: member,
        created_at: new Date().toISOString(),
        createdAt: 'Just now',
      }

      // 1. Save using Team Member A's hook/function if present in src/hooks/useSupabaseData.ts
      let savedByHook = false
      const hookKeys = Object.keys(supabaseDataModules)
      if (hookKeys.length > 0 && supabaseDataModules[hookKeys[0]]) {
        const hookMod = supabaseDataModules[hookKeys[0]]
        try {
          if (typeof hookMod.createPost === 'function') {
            await hookMod.createPost({
              text: trimmedBody,
              content: trimmedBody,
              body: trimmedBody,
              media_url: uploadedMediaUrl,
              media_type: uploadedMediaType,
              community_id: communityId || null,
              author_name: member?.name || 'Community Member',
            })
            savedByHook = true
          } else if (typeof hookMod.insertPost === 'function') {
            await hookMod.insertPost({
              text: trimmedBody,
              content: trimmedBody,
              body: trimmedBody,
              media_url: uploadedMediaUrl,
              media_type: uploadedMediaType,
              community_id: communityId || null,
              author_name: member?.name || 'Community Member',
            })
            savedByHook = true
          }
        } catch (hookErr: any) {
          console.warn('Hook post creation error:', hookErr)
        }
      }

      // 2. Direct Supabase insert if client credentials exist and hook wasn't used
      if (
        !savedByHook &&
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        try {
          await supabase.from('posts').insert({
            text: trimmedBody,
            content: trimmedBody,
            media_url: uploadedMediaUrl,
            media_type: uploadedMediaType,
            community_id: communityId || null,
            author_name: member?.name || 'Community Member',
          })
        } catch (dbErr) {
          console.warn('Direct Supabase insert bypassed:', dbErr)
        }
      }

      // 3. Update local AppContext so feed reflects post immediately
      if (appCreatePost) {
        try {
          appCreatePost({
            body: trimmedBody,
            communityId,
            mediaUrl: uploadedMediaUrl || undefined,
            mediaType: uploadedMediaType || undefined,
          })
        } catch (ctxErr) {
          console.warn('AppContext createPost bypassed:', ctxErr)
        }
      }

      // 4. Notify parent / Team Member C callback
      onPostCreated?.(postPayload)

      // Reset form
      setBody('')
      handleClearMedia()
    } catch (err: any) {
      setError(err?.message || 'Failed to create post. Please try again.')
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  const isBusy = isUploading || isSubmitting
  const isPostEmpty = !body.trim() && !file

  return (
    <Card className={`p-4 sm:p-5 ${className ?? ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar label={member?.avatar || 'U'} />
          <textarea
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 min-h-24"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            disabled={isBusy}
            placeholder={
              placeholder ||
              (communityId
                ? 'Share something with this community…'
                : 'Share an update with your community…')
            }
          />
        </div>

        {/* Media Preview */}
        {previewUrl && (
          <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-950/5">
            {fileType === 'video' ? (
              <video
                src={previewUrl}
                controls
                className="max-h-80 w-full rounded-xl bg-slate-950"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-80 w-full rounded-xl object-cover"
              />
            )}

            {/* Clear Media Button */}
            <button
              type="button"
              onClick={handleClearMedia}
              disabled={isBusy}
              className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-slate-950/70 text-white backdrop-blur transition hover:bg-slate-950 disabled:opacity-50"
              aria-label="Remove media"
            >
              <X className="size-4" />
            </button>

            {/* File Info Badge */}
            {file && (
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                {fileType === 'video' ? (
                  <Film className="size-3.5" />
                ) : (
                  <ImageIcon className="size-3.5" />
                )}
                <span className="max-w-[200px] truncate">{file.name}</span>
                <span className="text-slate-300">
                  ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar & Action Buttons */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isBusy}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
            >
              <ImageIcon className="size-4" />
              <span>{file ? 'Change media' : 'Add media'}</span>
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isBusy || isPostEmpty}
            className="gap-1.5 bg-teal-700 font-medium text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Post</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

