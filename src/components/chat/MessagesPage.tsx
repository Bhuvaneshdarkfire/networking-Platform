import { ArrowLeft, FileText, LoaderCircle, MessageCircle, Paperclip, Send, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { Avatar, fieldClass } from '../ui/primitives'
import { Button } from '../ui/button'

interface ChatProfile { id: string; name: string; username: string; avatar_url: string | null }
interface ChatMessage { id: string; conversation_id: string; sender_id: string; body: string; attachment_path: string | null; attachment_name: string | null; attachment_type: string | null; attachmentUrl?: string; created_at: string }
interface Conversation { id: string; other: ChatProfile; messages: ChatMessage[]; updated_at: string }

const profileInitials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

export function MessagesPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File>()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async (selectId?: string) => {
    if (!user) return
    const { data: ownMemberships, error: membershipsError } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', user.id)
    if (membershipsError) { setError(membershipsError.message); setLoading(false); return }
    const ids = (ownMemberships ?? []).map((item) => item.conversation_id)
    if (!ids.length) { setConversations([]); setLoading(false); return }
    const [conversationResult, memberResult, profileResult, messageResult] = await Promise.all([
      supabase.from('conversations').select('*').in('id', ids).order('updated_at', { ascending: false }),
      supabase.from('conversation_members').select('*').in('conversation_id', ids),
      supabase.from('profiles').select('id,name,username,avatar_url'),
      supabase.from('messages').select('*').in('conversation_id', ids).order('created_at'),
    ])
    const requestError = conversationResult.error || memberResult.error || profileResult.error || messageResult.error
    if (requestError) { setError(requestError.message); setLoading(false); return }
    const profiles = new Map((profileResult.data ?? []).map((profile) => [profile.id, profile]))
    const rawMessages = messageResult.data ?? []
    const resolvedMessages = await Promise.all(rawMessages.map(async (message) => {
      if (!message.attachment_path) return message
      const signed = await supabase.storage.from('chat-files').createSignedUrl(message.attachment_path, 3600)
      return { ...message, attachmentUrl: signed.data?.signedUrl }
    }))
    const mapped = (conversationResult.data ?? []).map((conversation) => {
      const otherId = (memberResult.data ?? []).find((item) => item.conversation_id === conversation.id && item.user_id !== user.id)?.user_id
      return {
        id: conversation.id,
        other: profiles.get(otherId ?? '') ?? { id: otherId ?? '', name: 'Member', username: 'member', avatar_url: null },
        messages: resolvedMessages.filter((message) => message.conversation_id === conversation.id),
        updated_at: conversation.updated_at,
      }
    })
    setConversations(mapped)
    setActiveId((current) => selectId ?? current ?? mapped[0]?.id ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    const otherUserId = params.get('user')
    const initialize = async () => {
      if (otherUserId && user && otherUserId !== user.id) {
        const { data, error: rpcError } = await supabase.rpc('get_or_create_direct_conversation', { other_user_id: otherUserId })
        if (rpcError) setError(rpcError.message)
        else { setParams({}); await loadConversations(data) }
      } else await loadConversations()
    }
    void initialize()
  }, [user, params, setParams, loadConversations])

  useEffect(() => {
    if (!user) return
    const channel = supabase.channel(`messages-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => void loadConversations())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user, loadConversations])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [activeId, conversations])
  const active = conversations.find((conversation) => conversation.id === activeId)

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return
    if (selected.size > 10 * 1024 * 1024) { setError('Chat files must be 10 MB or smaller.'); return }
    setFile(selected); setError('')
  }

  const send = async (event: FormEvent) => {
    event.preventDefault()
    if (!user || !active || (!body.trim() && !file)) return
    setSending(true); setError('')
    let attachmentPath: string | undefined
    try {
      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
        attachmentPath = `${active.id}/${user.id}/${crypto.randomUUID()}-${safeName}`
        const upload = await supabase.storage.from('chat-files').upload(attachmentPath, file)
        if (upload.error) throw upload.error
      }
      const result = await supabase.from('messages').insert({ conversation_id: active.id, sender_id: user.id, body: body.trim(), attachment_path: attachmentPath, attachment_name: file?.name, attachment_type: file?.type })
      if (result.error) throw result.error
      setBody(''); setFile(undefined); if (fileRef.current) fileRef.current.value = ''
      await loadConversations(active.id)
    } catch (caught) {
      if (attachmentPath) await supabase.storage.from('chat-files').remove([attachmentPath])
      setError(caught instanceof Error ? caught.message : 'Message could not be sent')
    } finally { setSending(false) }
  }

  return <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-5xl overflow-hidden rounded-xl border border-[#E7E0D6] bg-white">
    <aside className={cn('w-full shrink-0 border-r border-[#E7E0D6] sm:w-80', active && 'hidden sm:block')}>
      <div className="border-b border-[#E7E0D6] p-4"><h1 className="font-heading text-2xl font-semibold">Messages</h1><p className="text-sm text-[#6F675E]">Your private conversations</p></div>
      {loading ? <LoaderCircle className="mx-auto mt-10 animate-spin text-[#2F6B4F]" /> : conversations.length === 0 ? <div className="p-8 text-center text-sm text-[#6F675E]"><MessageCircle className="mx-auto mb-3 size-8" />Connect with someone from Discover People to start chatting.</div> : conversations.map((conversation) => {
        const last = conversation.messages.at(-1)
        return <button key={conversation.id} onClick={() => setActiveId(conversation.id)} className={cn('flex w-full gap-3 border-b border-[#F3EFE8] p-4 text-left hover:bg-[#FAF7F2]', activeId === conversation.id && 'bg-[#E4F0E9]')}><Avatar label={profileInitials(conversation.other.name)} src={conversation.other.avatar_url ?? undefined} /><div className="min-w-0"><p className="font-semibold text-[#2B2622]">{conversation.other.name}</p><p className="truncate text-sm text-[#6F675E]">{last?.body || last?.attachment_name || 'New conversation'}</p></div></button>
      })}
    </aside>
    <section className={cn('flex min-w-0 flex-1 flex-col', !active && 'hidden sm:flex')}>
      {active ? <><header className="flex h-16 items-center gap-3 border-b border-[#E7E0D6] px-4"><button className="sm:hidden" onClick={() => setActiveId(null)}><ArrowLeft /></button><Avatar label={profileInitials(active.other.name)} src={active.other.avatar_url ?? undefined} /><div><p className="font-semibold">{active.other.name}</p><p className="text-xs text-[#6F675E]">@{active.other.username}</p></div></header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-[#FAF7F2] p-4">{active.messages.map((message) => {
          const own = message.sender_id === user?.id
          return <div key={message.id} className={cn('flex', own ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[82%] rounded-xl px-3 py-2 text-sm', own ? 'bg-[#2F6B4F] text-white' : 'border border-[#E7E0D6] bg-white text-[#2B2622]')}>
            {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
            {message.attachmentUrl && (message.attachment_type?.startsWith('image/') ? <a href={message.attachmentUrl} target="_blank" rel="noreferrer"><img src={message.attachmentUrl} alt={message.attachment_name ?? 'Attachment'} className="mt-2 max-h-64 rounded-lg object-cover" /></a> : <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 underline"><FileText className="size-4" />{message.attachment_name}</a>)}
            <p className={cn('mt-1 text-[10px]', own ? 'text-white/65' : 'text-[#6F675E]')}>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div></div>
        })}<div ref={bottomRef} /></div>
        <form onSubmit={send} className="border-t border-[#E7E0D6] p-3"><input ref={fileRef} type="file" className="hidden" accept="image/*,video/mp4,video/webm,application/pdf,text/plain" onChange={chooseFile} />{file && <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#F3EFE8] px-3 py-2 text-xs"><Paperclip className="size-3" /><span className="truncate">{file.name}</span><button type="button" className="ml-auto" onClick={() => setFile(undefined)}><X className="size-3" /></button></div>}{error && <p className="mb-2 text-xs text-red-600">{error}</p>}<div className="flex gap-2"><Button type="button" variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="Attach file"><Paperclip className="size-4" /></Button><input className={fieldClass} placeholder="Write a message…" value={body} onChange={(event) => setBody(event.target.value)} /><Button size="icon" disabled={sending || (!body.trim() && !file)}>{sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}</Button></div></form>
      </> : <div className="grid h-full place-items-center text-center text-[#6F675E]"><div><MessageCircle className="mx-auto mb-3 size-10" /><p className="font-heading text-xl text-[#2B2622]">Choose a conversation</p><p className="text-sm">Your messages will appear here.</p></div></div>}
    </section>
  </div>
}
