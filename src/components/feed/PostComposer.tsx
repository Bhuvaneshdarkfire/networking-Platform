import { CreatePost, type CreatePostProps } from './CreatePost'

export function PostComposer(props: CreatePostProps) {
  return <CreatePost {...props} />
}
