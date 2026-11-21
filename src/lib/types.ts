export interface Member {
  id: string
  name: string
  handle: string
  avatar: string
  avatarUrl?: string
  bio: string
  location: string
  interests: string[]
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
  createdAt: string
  likes: number
  liked: boolean
  comments: Comment[]
}

export interface Community {
  id: string
  name: string
  description: string
  category: string
  cover: string
  coverUrl?: string
  members: number
  joined: boolean
}
