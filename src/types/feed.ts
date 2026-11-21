import type { Member } from '../lib/types'

export interface FeedAuthor {
  id?: string
  name: string
  handle?: string
  avatar?: string
}

export interface FeedComment {
  id: string
  author: Member | FeedAuthor
  body: string
  createdAt: string
}

export interface FeedPost {
  id?: string
  // Content / text fields (supports text, content, or body)
  text?: string
  content?: string
  body?: string

  // Author fields (supports author object or flat author_name/author_avatar)
  author?: Member | FeedAuthor
  author_name?: string
  author_avatar?: string
  author_handle?: string

  // Media fields (supports snake_case and camelCase)
  media_url?: string | null
  mediaUrl?: string | null
  media_type?: 'image' | 'video' | string | null
  mediaType?: 'image' | 'video' | string | null

  // Community fields
  community_id?: string | null
  communityId?: string | null
  community_name?: string | null

  // Timestamp fields
  created_at?: string
  createdAt?: string

  // Interactions / engagement
  likes?: number
  liked?: boolean
  comments_count?: number
  comments?: FeedComment[]
}

export type AnyFeedPost = FeedPost

export interface CreatePostPayload {
  id?: string
  text: string
  content?: string
  body?: string
  media_url?: string | null
  mediaUrl?: string | null
  media_type?: 'image' | 'video' | null
  mediaType?: 'image' | 'video' | null
  community_id?: string | null
  communityId?: string | null
  author_name?: string
  author?: Member | FeedAuthor
  created_at?: string
  createdAt?: string
}

export interface CloudinaryUploadResponse {
  secure_url: string
  url: string
  resource_type: string
  format?: string
  public_id: string
}
