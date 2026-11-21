export interface Member {
  id: string
  name: string
  handle: string
  avatar: string
  avatarUrl?: string
  bio: string
  location: string
  interests: string[]
  title?: string
  currentlyBuilding?: string
  openTo?: string
  mutualConnections?: number
  connectionStatus?: 'none' | 'pending' | 'connected'
}

export interface Comment {
  id: string
  author: Member
  body: string
  createdAt: string
}

export interface Post {
  id: string
  author: Member
  body: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  communityId?: string
  communityName?: string
  createdAt: string
  likes: number
  liked: boolean
  comments: Comment[]
  tags?: string[]
  shares?: number
  saves?: number
}

export interface Community {
  id: string
  name: string
  description: string
  category: string
  cover: string
  members: number
  joined: boolean
  status?: 'active' | 'quiet'
}

export interface Conversation {
  id: string
  person: Member
  lastMessage: string
  time: string
  unread: boolean
}
