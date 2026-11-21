
import { supabase } from '../lib/supabase'

export async function uploadPostMedia(file: File) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) throw new Error('Please log in first.')

    const fileExtension = file.name.split('.').pop() || 'file'
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`

    const { error } = await supabase.storage
        .from('post-media')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
        })

    if (error) throw error

    const { data } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath)

    return data.publicUrl
}
