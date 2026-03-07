import { useEffect, useRef } from 'react'

interface SkippedRegionCropProps {
  /** The source receipt image file to crop from */
  file: File
  /** Bounding box as 0..1 fractions of the image dimensions (top-left origin) */
  boundingBox: { x: number; y: number; width: number; height: number }
}

const MAX_DISPLAY_WIDTH = 320

export function SkippedRegionCrop({ file, boundingBox }: SkippedRegionCropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Compute pixel crop dimensions from 0..1 fractions
      const srcX = boundingBox.x * img.naturalWidth
      const srcY = boundingBox.y * img.naturalHeight
      const srcW = boundingBox.width * img.naturalWidth
      const srcH = boundingBox.height * img.naturalHeight

      // Scale down to MAX_DISPLAY_WIDTH if wider
      const scale = srcW > MAX_DISPLAY_WIDTH ? MAX_DISPLAY_WIDTH / srcW : 1
      const destW = Math.round(srcW * scale)
      const destH = Math.round(srcH * scale)

      canvas.width = destW
      canvas.height = destH

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, destW, destH)
    }

    img.src = url

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file, boundingBox])

  return (
    <canvas
      ref={canvasRef}
      className="rounded border border-gray-200 max-w-full"
      aria-label="Cropped receipt region that could not be read"
    />
  )
}
