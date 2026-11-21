import type { Post } from '../../lib/types'
import { FeedCard, type FeedCardProps } from './FeedCard'

export interface PostCardProps extends Omit<FeedCardProps, 'post'> {
  post: Post
}

export function PostCard(props: PostCardProps) {
  return <FeedCard {...props} />
}
