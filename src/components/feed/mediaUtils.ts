/** Adapted from the core-features branch to handle stored and external media. */
export function isVideoUrl(url?: string | null, explicitType?: string | null) {
  if (!url) return false
  if (explicitType === 'video') return true
  if (explicitType === 'image') return false
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase()
  return ['.mp4', '.webm', '.mov', '.ogg', '.m4v', '.ogv'].some((extension) => cleanUrl.endsWith(extension))
    || url.includes('/video/upload/')
}
