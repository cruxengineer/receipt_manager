import { useState, useEffect } from 'react'
import { type FileWithPreview, validateImageFile } from '@/types/capture'

/**
 * Manages the list of receipt files selected by the user.
 *
 * Memory note: Every URL.createObjectURL call must be paired with
 * URL.revokeObjectURL to prevent memory leaks. This hook handles
 * revocation in three places:
 *   1. removeFile — revokes the removed file's URL immediately
 *   2. clearFiles — revokes all URLs then empties the array
 *   3. useEffect cleanup — revokes all URLs when component unmounts
 *      or files reference changes (handles StrictMode double-mount)
 */
export function useReceiptFiles() {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  // Revoke all object URLs when files array changes (unmount cleanup)
  useEffect(() => {
    return () => {
      files.forEach(({ preview }) => URL.revokeObjectURL(preview))
    }
  }, [files])

  /**
   * Add files from a FileList (from input onChange).
   * Non-image files are silently filtered out.
   * Appends to existing files — does not replace.
   */
  const addFiles = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return

    const newEntries: FileWithPreview[] = Array.from(selected)
      .filter(validateImageFile)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }))

    if (newEntries.length === 0) return

    setFiles((prev) => [...prev, ...newEntries])
  }

  /**
   * Remove a single file by its stable ID.
   * Revokes the preview URL immediately to free memory.
   */
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  /**
   * Remove all files and revoke all preview URLs.
   * Call this when the user starts over or on successful submission.
   */
  const clearFiles = () => {
    setFiles((prev) => {
      prev.forEach(({ preview }) => URL.revokeObjectURL(preview))
      return []
    })
  }

  return { files, addFiles, removeFile, clearFiles }
}
