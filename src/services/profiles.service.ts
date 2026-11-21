
import { supabase } from '../lib/supabase'

export interface ProfileData {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
    bio: string | null
    location: string | null
    interests: string[]
    created_at: string
}

// Get a user's profile
export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error

    return data as ProfileData
}

// Update a user's profile
export async function updateProfile(
    userId: string,
    updates: Partial<
        Pick<
            ProfileData,
            'full_name' | 'username' | 'avatar_url' | 'bio' | 'location' | 'interests'
        >
    >
) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error

    return data as ProfileData
}
