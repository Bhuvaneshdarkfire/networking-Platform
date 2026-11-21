
import { supabase } from '../lib/supabase'

// Fetch all posts

export async function getPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*),
            post_likes(user_id),
            comments(
                id,
                content,
                created_at,
                author:profiles!comments_author_id_fkey(*)
            )
        `)
        .order('created_at', { ascending: false })

    if (error) throw error

    return data
}


// Create a new post
export async function createPost(content: string, communityId?: string, mediaUrl?: string, mediaType?: 'image' | 'video') {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Please log in first')

    const { data, error } = await supabase
        .from('posts')
        .insert({
            author_id: user.id,
            content,
            community_id: communityId ?? null,
            media_url: mediaUrl ?? null,
            media_type: mediaType ?? null,
        })
        .select()
        .single()

    if (error) throw error

    return data
}

// Delete your own post
export async function deletePost(postId: string) {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

    if (error) throw error
}
