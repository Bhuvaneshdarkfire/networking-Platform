/**
 * Accurately detects whether a media URL corresponds to a video or an image.
 * Checks for common video extensions (.mp4, .webm, .mov, .ogg) and Cloudinary video upload paths.
 */
export function isVideoUrl(
  url?: string | null,
  explicitType?: string | null,
): boolean {
  if (!url) return false
  if (explicitType === 'video') return true
  if (explicitType === 'image') return false

  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase()

  // Video extensions
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.m4v', '.ogv']
  if (videoExtensions.some((ext) => cleanUrl.endsWith(ext))) {
    return true
  }

  // Cloudinary video upload path patterns
  if (
    url.includes('/video/upload/') ||
    url.includes('/video/authenticated/')
  ) {
    return true
  }

  return false
}

