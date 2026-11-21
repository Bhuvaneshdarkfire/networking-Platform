import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { currentMember, initialCommunities, initialPosts } from '../lib/mock-data'
import type { Community, Member, Post } from '../lib/types'

interface NewPost {
  body: string
  communityId?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
}

interface AppContextValue {
  member: Member
  posts: Post[]
  communities: Community[]
  createPost: (post: NewPost) => void
  toggleLike: (postId: string) => void
  addComment: (postId: string, body: string) => void
  toggleCommunity: (communityId: string) => void
  updateProfile: (updates: Partial<Pick<Member, 'name' | 'bio' | 'location' | 'interests'>>) => void
}

const AppStateContext = createContext<AppContextValue | undefined>(undefined)

function loadValue<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState(() => loadValue('connectly-member', currentMember))
  const [posts, setPosts] = useState(() => loadValue('connectly-posts', initialPosts))
  const [communities, setCommunities] = useState(() => loadValue('connectly-communities', initialCommunities))

  useEffect(() => localStorage.setItem('connectly-member', JSON.stringify(member)), [member])
  useEffect(() => {
    try {
      localStorage.setItem('connectly-posts', JSON.stringify(posts))
    } catch {
      // Uploaded media can exceed the browser's local demo storage quota.
    }
  }, [posts])
  useEffect(() => localStorage.setItem('connectly-communities', JSON.stringify(communities)), [communities])

  const value = useMemo<AppContextValue>(() => ({
    member,
    posts,
    communities,
    createPost: (post) => setPosts((items) => [{
      id: crypto.randomUUID(), author: member, createdAt: 'now', likes: 0, liked: false, comments: [], ...post,
    }, ...items]),
    toggleLike: (postId) => setPosts((items) => items.map((post) => post.id === postId
      ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
      : post)),
    addComment: (postId, body) => setPosts((items) => items.map((post) => post.id === postId
      ? { ...post, comments: [...post.comments, { id: crypto.randomUUID(), author: member, body, createdAt: 'now' }] }
      : post)),
    toggleCommunity: (communityId) => setCommunities((items) => items.map((community) => community.id === communityId
      ? { ...community, joined: !community.joined, members: community.members + (community.joined ? -1 : 1) }
      : community)),
    updateProfile: (updates) => setMember((profile) => ({ ...profile, ...updates })),
  }), [communities, member, posts])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- The state hook belongs to its provider contract.
export function useApp() {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
