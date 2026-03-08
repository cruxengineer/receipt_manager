import type { ParseReceiptResult, ReceiptItem } from '@/types/ai'

const MOCK_ITEMS: ReceiptItem[] = [
  { name: 'Margherita Pizza', price: 14.00 },
  { name: 'Caesar Salad', price: 9.50 },
  { name: 'Sparkling Water', price: 3.00 },
  { name: 'Tiramisu', price: 7.00 },
  { name: 'Tax', price: 2.75 },
  { name: 'Tip', price: 5.00 },
]

// Re-encode any image file as a JPEG via canvas.
// This guarantees clean JPEG base64 regardless of source format (HEIC, HEIF, PNG, etc.)
// and keeps file sizes manageable for the Anthropic API.
async function normalizeToJpegBase64(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = url
    })
    const canvas = document.createElement('canvas')
    // Cap at 2048px on the long edge to keep payload sizes reasonable
    const MAX = 2048
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    return dataUrl.split(',')[1]
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function parseReceipt(files: File[]): Promise<ParseReceiptResult> {
  // Mock mode — no API call
  if (import.meta.env.VITE_MOCK_MODE === 'true') {
    return { items: MOCK_ITEMS, skippedRegions: [] }
  }

  // Convert files to base64 for the server-side Anthropic call.
  // All files are normalized to JPEG via canvas so HEIC and other formats work reliably.
  const images = await Promise.all(
    files.map(async (file) => {
      const base64 = await normalizeToJpegBase64(file)
      return { base64, mediaType: 'image/jpeg' }
    }),
  )

  let response: Response
  try {
    response = await fetch('/api/parse-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    })
  } catch {
    throw new Error('Could not reach the AI service. Check your connection and try again.')
  }

  const data = (await response.json()) as { error?: string } & Partial<ParseReceiptResult>

  if (!response.ok) {
    throw new Error(
      data.error ?? 'Could not reach the AI service. Check your connection and try again.',
    )
  }

  const rawItems = (data.items ?? []) as Array<{ name?: unknown; price?: unknown }>

  // Filter Subtotal/Total — defense in depth (server prompt already excludes them)
  const EXCLUDED_NAMES = new Set(['subtotal', 'total'])
  const items: ReceiptItem[] = rawItems
    .filter((item) => {
      const name = String(item.name ?? '').trim()
      return name !== '' && !EXCLUDED_NAMES.has(name.toLowerCase())
    })
    .map((item) => ({
      name: String(item.name).trim(),
      price: Number(item.price),
    }))

  const skippedRegions = Array.isArray(data.skippedRegions) ? data.skippedRegions : []

  return { items, skippedRegions }
}
