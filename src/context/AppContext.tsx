
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import type { Community, Member, Post } from '../lib/types'
import { getProfile, updateProfile as saveProfile } from '../services/profiles.service'
import { getPosts, createPost as savePost } from '../services/posts.service'
import {
  likePost,
  unlikePost,
  addComment as saveComment,
} from '../services/interactions.service'
import {
  getCommunities,
  joinCommunity,
  leaveCommunity,
} from '../services/communities.service'

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
  createPost: (post: NewPost) => Promise<void>
  toggleLike: (postId: string) => Promise<void>
  addComment: (postId: string, body: string) => Promise<void>
  toggleCommunity: (communityId: string) => Promise<void>
  updateProfile: (updates: Partial<Pick<Member, 'name' | 'bio' | 'location' | 'interests'>>) => Promise<void>
}

const AppStateContext = createContext<AppContextValue | undefined>(undefined)

const emptyMember: Member = {
  id: '',
  name: 'Member',
  handle: '',
  avatar: 'M',
  bio: '',
  location: '',
  interests: [],
}

function mapProfile(profile: any): Member {
  const name = profile.full_name || 'Member'

  return {
    id: profile.id,
    name,
    handle: profile.username ? `@${profile.username}` : '@member',
    avatar: profile.avatar_url || name.charAt(0).toUpperCase(),
    bio: profile.bio || '',
    location: profile.location || '',
    interests: profile.interests || [],
  }
}

function mapCommunity(item: any, joinedIds: Set<string>): Community {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    category: item.category || 'General',
    cover: item.cover_url || '🌐',
    members: item.members || 0,
    joined: joinedIds.has(item.id),
  }
}

function mapPost(item: any, userId: string): Post {
  const author = item.author
  const likes = item.post_likes || []
  const comments = item.comments || []

  return {
    id: item.id,
    author: author ? mapProfile(author) : emptyMember,
    body: item.content || '',
    mediaUrl: item.media_url || undefined,
    mediaType: item.media_type || undefined,
    communityId: item.community_id || undefined,
    createdAt: new Date(item.created_at).toLocaleString(),
    likes: likes.length,
    liked: likes.some((like: any) => like.user_id === userId),
    comments: comments.map((comment: any) => ({
      id: comment.id,
      author: comment.author ? mapProfile(comment.author) : emptyMember,
      body: comment.content,
      createdAt: new Date(comment.created_at).toLocaleString(),
    })),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()

  const [member, setMember] = useState<Member>(emptyMember)
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setMember(emptyMember)
      setPosts([])
      setCommunities([])
      setDataLoading(false)
      return
    }

    let active = true

    async function loadData() {
      setDataLoading(true)

      try {
        const [profileData, postData, communityData] = await Promise.all([
          getProfile(user!.id),
          getPosts(),
          getCommunities(),
        ])

        const membershipResult = await import('../lib/supabase').then(
          ({ supabase }) =>
            supabase
              .from('community_members')
              .select('community_id')
              .eq('user_id', user!.id),
        )

        if (membershipResult.error) throw membershipResult.error

        if (!active) return

        const joinedIds = new Set(
          membershipResult.data.map((item) => item.community_id),
        )

        setMember(mapProfile(profileData))
        setCommunities(
          communityData.map((item) => mapCommunity(item, joinedIds)),
        )
        setPosts(postData.map((item: any) => mapPost(item, user!.id)))
      } catch (error) {
        console.error('Failed to load ConnectHub data:', error)
      } finally {
        if (active) setDataLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [user, authLoading])

  const value = useMemo<AppContextValue>(() => ({
    member,
    posts,
    communities,

    createPost: async (post) => {
      const saved = await savePost(
        post.body,
        post.communityId,
        post.mediaUrl,
        post.mediaType,
      )

      const refreshed = await getPosts()
      setPosts(refreshed.map((item: any) => mapPost(item, user?.id || '')))
      void saved
    },

    toggleLike: async (postId) => {
      const post = posts.find((item) => item.id === postId)
      if (!post) return

      if (post.liked) {
        await unlikePost(postId)
      } else {
        await likePost(postId)
      }

      setPosts((items) =>
        items.map((item) =>
          item.id === postId
            ? {
              ...item,
              liked: !post.liked,
              likes: item.likes + (post.liked ? -1 : 1),
            }
            : item,
        ),
      )
    },

    addComment: async (postId, body) => {
      const saved = await saveComment(postId, body)

      setPosts((items) =>
        items.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: saved.id,
                  author: member,
                  body: saved.content,
                  createdAt: new Date(saved.created_at).toLocaleString(),
                },
              ],
            }
            : post,
        ),
      )
    },

    toggleCommunity: async (communityId) => {
      const community = communities.find((item) => item.id === communityId)
      if (!community) return

      if (community.joined) {
        await leaveCommunity(communityId)
      } else {
        await joinCommunity(communityId)
      }

      setCommunities((items) =>
        items.map((item) =>
          item.id === communityId
            ? {
              ...item,
              joined: !community.joined,
              members: item.members + (community.joined ? -1 : 1),
            }
            : item,
        ),
      )
    },

    updateProfile: async (updates) => {
      const saved = await saveProfile(member.id, {
        full_name: updates.name,
        bio: updates.bio,
        location: updates.location,
        interests: updates.interests,
      })

      setMember(mapProfile(saved))
    },
  }), [member, posts, communities, user])

  if (authLoading || dataLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-600">
        Loading ConnectHub...
      </div>
    )
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppStateContext)

  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }

  return context
}
