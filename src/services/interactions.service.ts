
import { supabase } from '../lib/supabase'

// Like a post
export async function likePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Please log in first')

    const { error } = await supabase
        .from('post_likes')
        .insert({
            post_id: postId,
            user_id: user.id,
        })

    if (error) throw error
}

// Unlike a post
export async function unlikePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Please log in first')

    const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

    if (error) throw error
}

// Add a comment

export async function addComment(postId: string, content: string) {
    const cleanContent = content.trim()

    if (!postId) throw new Error('Post ID is required')
    if (!cleanContent) throw new Error('Comment cannot be empty')

    const { data: { user }, error: authError } =
        await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) throw new Error('Please log in first')

    const { data, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            author_id: user.id,
            content: cleanContent,
        })
        .select()
        .single()

    if (error) throw error

    return data
}


// Fetch comments for a post
export async function getComments(postId: string) {
    const { data, error } = await supabase
        .from('comments')
        .select(`
      *,
      author:profiles!comments_author_id_fkey(*)
    `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

    if (error) throw error

    return data
}
