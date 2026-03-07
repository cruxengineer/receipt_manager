import type { ParseReceiptResult, ReceiptItem } from '@/types/ai'

const MOCK_ITEMS: ReceiptItem[] = [
  { name: 'Margherita Pizza', price: 14.00 },
  { name: 'Caesar Salad', price: 9.50 },
  { name: 'Sparkling Water', price: 3.00 },
  { name: 'Tiramisu', price: 7.00 },
  { name: 'Tax', price: 2.75 },
  { name: 'Tip', price: 5.00 },
]

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function parseReceipt(files: File[]): Promise<ParseReceiptResult> {
  // Mock mode — no API call
  if (import.meta.env.VITE_MOCK_MODE === 'true') {
    return { items: MOCK_ITEMS, skippedRegions: [] }
  }

  // Convert files to base64 for the server-side Anthropic call
  const images = await Promise.all(
    files.map(async (file) => {
      const base64 = await fileToBase64(file)
      // Normalize HEIC → jpeg (Anthropic API does not accept heic media type)
      const mediaType =
        file.type === 'image/heic' || file.type === 'image/heif' ? 'image/jpeg' : file.type
      return { base64, mediaType }
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
