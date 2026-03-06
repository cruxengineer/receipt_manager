/**
 * A file selected by the user, augmented with a blob preview URL and stable ID.
 * The preview URL is created with URL.createObjectURL and must be revoked on cleanup.
 */
export interface FileWithPreview {
  file: File
  preview: string  // blob: URL — must call URL.revokeObjectURL(preview) when done
  id: string       // stable key for React list rendering and individual removal
}

/**
 * Accepted MIME types for receipt images.
 * HEIC/HEIF are included for iPhone camera photos.
 * The fallback `file.type.startsWith('image/')` catches edge cases.
 */
const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
])

const MAX_FILE_SIZE_MB = 20

/**
 * Returns true if the file is an image within the size limit.
 * Non-images are silently filtered rather than shown as errors —
 * the user selected from the native OS picker which already filtered by type,
 * so this is a safety net only.
 */
export function validateImageFile(file: File): boolean {
  if (!ACCEPTED_TYPES.has(file.type) && !file.type.startsWith('image/')) {
    return false
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return false
  }
  return true
}
