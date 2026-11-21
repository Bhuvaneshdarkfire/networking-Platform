
import { supabase } from '../lib/supabase'

// Fetch all communities with member counts
export async function getCommunities() {
    const { data, error } = await supabase
        .from('communities')
        .select(`
      *,
      community_members(count)
    `)
        .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((community) => ({
        ...community,
        members: community.community_members?.[0]?.count ?? 0,
    }))
}

// Create a community
export async function createCommunity(
    name: string,
    slug: string,
    description: string,
    category: string,
    coverUrl?: string,
) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Please log in first')

    const { data, error } = await supabase
        .from('communities')
        .insert({
            name,
            slug,
            description,
            category,
            cover_url: coverUrl ?? null,
            created_by: user.id,
        })
        .select()
        .single()

    if (error) throw error

    return data
}

// Join a community

export async function joinCommunity(communityId: string) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) throw new Error('Please log in first')

    const { error } = await supabase
        .from('community_members')
        .upsert(
            {
                community_id: communityId,
                user_id: user.id,
                role: 'member',
            },
            {
                onConflict: 'community_id,user_id',
                ignoreDuplicates: true,
            }
        )

    if (error) throw error
}


// Leave a community
export async function leaveCommunity(communityId: string) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Please log in first')

    const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id)

    if (error) throw error
}

// Check whether current user joined a community
export async function hasJoinedCommunity(communityId: string) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (error) throw error

    return Boolean(data)
}