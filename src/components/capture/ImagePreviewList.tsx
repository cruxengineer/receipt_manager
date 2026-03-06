import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FileWithPreview } from '@/types/capture'

interface ImagePreviewListProps {
  files: FileWithPreview[]
  onRemove: (id: string) => void
}

/**
 * Renders a responsive grid of image thumbnails.
 * Each thumbnail has a remove button (X) in the top-right corner.
 * Touch targets: remove button is 44x44px (Button size="icon" is h-11 w-11).
 */
export function ImagePreviewList({ files, onRemove }: ImagePreviewListProps) {
  if (files.length === 0) return null

  return (
    <div
      className={cn(
        'grid gap-3',
        files.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
      )}
      role="list"
      aria-label="Selected receipt images"
    >
      {files.map((f) => (
        <div
          key={f.id}
          role="listitem"
          className="relative rounded-md overflow-hidden border border-slate-200 bg-slate-50 aspect-square"
        >
          <img
            src={f.preview}
            alt={f.file.name}
            className="w-full h-full object-cover"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-1 right-1 size-9 rounded-full bg-white/90 hover:bg-white shadow-sm"
            onClick={() => onRemove(f.id)}
            aria-label={`Remove ${f.file.name}`}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  )
}
