import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import type { Community, Member, Post } from '../lib/types'

interface NewPost { body: string; communityId?: string; file?: File }
interface AppContextValue {
  member: Member | null
  people: Member[]
  posts: Post[]
  communities: Community[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  createPost: (post: NewPost) => Promise<void>
  toggleLike: (postId: string) => Promise<void>
  addComment: (postId: string, body: string) => Promise<void>
  toggleCommunity: (communityId: string) => Promise<void>
  updateProfile: (updates: Partial<Pick<Member, 'name' | 'bio' | 'location' | 'interests'>>, avatarFile?: File) => Promise<void>
}

const AppStateContext = createContext<AppContextValue | undefined>(undefined)
const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U'
const relativeTime = (date: string) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [member, setMember] = useState<Member | null>(null)
  const [people, setPeople] = useState<Member[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setError('')
    const [profilesResult, interestsResult, profileInterestsResult, communitiesResult, membersResult, postsResult, commentsResult, likesResult] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('interests').select('*'),
      supabase.from('profile_interests').select('*'),
      supabase.from('communities').select('*').order('created_at', { ascending: false }),
      supabase.from('community_members').select('*'),
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at'),
      supabase.from('post_likes').select('*'),
    ])
    const firstError = [profilesResult, interestsResult, profileInterestsResult, communitiesResult, membersResult, postsResult, commentsResult, likesResult].find((result) => result.error)?.error
    if (firstError) { setError(firstError.message); setLoading(false); return }

    const interestNames = new Map((interestsResult.data ?? []).map((item) => [item.id, item.name]))
    const interestsByProfile = new Map<string, string[]>()
    for (const item of profileInterestsResult.data ?? []) {
      const list = interestsByProfile.get(item.profile_id) ?? []
      const name = interestNames.get(item.interest_id)
      if (name) list.push(name)
      interestsByProfile.set(item.profile_id, list)
    }
    const mappedPeople: Member[] = (profilesResult.data ?? []).map((profile) => ({
      id: profile.id, name: profile.name || profile.username, handle: `@${profile.username}`,
      avatar: initials(profile.name || profile.username), avatarUrl: profile.avatar_url ?? undefined,
      bio: profile.bio || '', location: profile.location || '', interests: interestsByProfile.get(profile.id) ?? [],
    }))
    const profileMap = new Map(mappedPeople.map((profile) => [profile.id, profile]))
    const fallbackMember: Member = { id: user.id, name: user.email?.split('@')[0] ?? 'Member', handle: '@member', avatar: 'M', bio: '', location: '', interests: [] }
    setPeople(mappedPeople.filter((profile) => profile.id !== user.id))
    setMember(profileMap.get(user.id) ?? fallbackMember)

    const communityMembers = membersResult.data ?? []
    setCommunities((communitiesResult.data ?? []).map((community) => ({
      id: community.id, name: community.name, description: community.description, category: community.category,
      cover: community.cover_url ? '🌿' : '🤝', coverUrl: community.cover_url ?? undefined,
      members: communityMembers.filter((item) => item.community_id === community.id).length,
      joined: communityMembers.some((item) => item.community_id === community.id && item.user_id === user.id),
    })))

    const comments = commentsResult.data ?? []
    const likes = likesResult.data ?? []
    setPosts((postsResult.data ?? []).map((post) => ({
      id: post.id, author: profileMap.get(post.author_id) ?? fallbackMember, body: post.body,
      mediaUrl: post.media_url ?? undefined, mediaType: post.media_type ?? undefined,
      communityId: post.community_id ?? undefined, createdAt: relativeTime(post.created_at),
      likes: likes.filter((like) => like.post_id === post.id).length,
      liked: likes.some((like) => like.post_id === post.id && like.user_id === user.id),
      comments: comments.filter((comment) => comment.post_id === post.id).map((comment) => ({
        id: comment.id, author: profileMap.get(comment.author_id) ?? fallbackMember,
        body: comment.body, createdAt: relativeTime(comment.created_at),
      })),
    })))
    setLoading(false)
  }, [user])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Load the authenticated user's backend data after mount.
    void refresh()
  }, [refresh])
  useEffect(() => {
    if (!user) return
    const channel = supabase.channel('platform-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => void refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => void refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => void refresh())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user, refresh])

  const createPost = async ({ body, communityId, file }: NewPost) => {
    if (!user) return
    let mediaUrl: string | undefined
    let mediaPath: string | undefined
    let mediaType: string | undefined
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
      mediaPath = `${user.id}/${crypto.randomUUID()}.${extension}`
      const upload = await supabase.storage.from('post-media').upload(mediaPath, file)
      if (upload.error) throw upload.error
      mediaUrl = supabase.storage.from('post-media').getPublicUrl(mediaPath).data.publicUrl
      mediaType = file.type.startsWith('video/') ? 'video' : 'image'
    }
    const { error: insertError } = await supabase.from('posts').insert({ author_id: user.id, community_id: communityId ?? null, body, media_url: mediaUrl, media_path: mediaPath, media_type: mediaType })
    if (insertError) { if (mediaPath) await supabase.storage.from('post-media').remove([mediaPath]); throw insertError }
    await refresh()
  }

  const toggleLike = async (postId: string) => {
    if (!user) return
    const post = posts.find((item) => item.id === postId)
    const query = post?.liked
      ? supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      : supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    const { error: actionError } = await query
    if (actionError) throw actionError
    await refresh()
  }

  const addComment = async (postId: string, body: string) => {
    if (!user) return
    const { error: actionError } = await supabase.from('comments').insert({ post_id: postId, author_id: user.id, body })
    if (actionError) throw actionError
    await refresh()
  }

  const toggleCommunity = async (communityId: string) => {
    if (!user) return
    const community = communities.find((item) => item.id === communityId)
    const query = community?.joined
      ? supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', user.id)
      : supabase.from('community_members').insert({ community_id: communityId, user_id: user.id, role: 'member' })
    const { error: actionError } = await query
    if (actionError) throw actionError
    await refresh()
  }

  const updateProfile = async (updates: Partial<Pick<Member, 'name' | 'bio' | 'location' | 'interests'>>, avatarFile?: File) => {
    if (!user) return
    let avatarUrl = member?.avatarUrl
    if (avatarFile) {
      const path = `${user.id}/avatar-${crypto.randomUUID()}.${avatarFile.name.split('.').pop() || 'jpg'}`
      const upload = await supabase.storage.from('avatars').upload(path, avatarFile)
      if (upload.error) throw upload.error
      avatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
    }
    const { error: profileError } = await supabase.from('profiles').update({ name: updates.name, bio: updates.bio, location: updates.location, avatar_url: avatarUrl }).eq('id', user.id)
    if (profileError) throw profileError
    if (updates.interests) {
      const { data: interestRows } = await supabase.from('interests').select('id,name').in('name', updates.interests)
      await supabase.from('profile_interests').delete().eq('profile_id', user.id)
      if (interestRows?.length) await supabase.from('profile_interests').insert(interestRows.map((interest) => ({ profile_id: user.id, interest_id: interest.id })))
    }
    await refresh()
  }

  const value: AppContextValue = { member, people, posts, communities, loading, error, refresh, createPost, toggleLike, addComment, toggleCommunity, updateProfile }
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- App hook is the provider's public contract.
export function useApp() {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
