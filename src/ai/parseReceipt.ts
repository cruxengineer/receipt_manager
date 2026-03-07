import Anthropic from '@anthropic-ai/sdk'
import type { ParseReceiptResult, ReceiptItem } from '@/types/ai'

const MOCK_ITEMS: ReceiptItem[] = [
  { name: 'Margherita Pizza', price: 14.00 },
  { name: 'Caesar Salad', price: 9.50 },
  { name: 'Sparkling Water', price: 3.00 },
  { name: 'Tiramisu', price: 7.00 },
  { name: 'Tax', price: 2.75 },
  { name: 'Tip', price: 5.00 },
]

/**
 * Convert a File to base64 string for Anthropic API.
 * Uses FileReader in browser environment.
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the "data:image/jpeg;base64," prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Build the system prompt for receipt parsing.
 * Explicit instructions to exclude subtotal/total and handle ambiguous items.
 */
const SYSTEM_PROMPT = `You are a receipt parser. Extract line items from receipt images.

Rules:
- Return ONLY a JSON object, no prose, no markdown code fences
- Include each purchased item as { "name": string, "price": number }
- Include Tax and Tip as named items if present (e.g., { "name": "Tax", "price": 2.50 })
- Do NOT include Subtotal or Total lines — these are derived values
- If an item's price is unreadable or ambiguous, skip it and add it to skippedRegions
- Never guess a price — if uncertain, skip the item
- For skipped items, provide the bounding box as fractions 0..1 of the image dimensions

Response format:
{
  "items": [
    { "name": "Item Name", "price": 12.50 }
  ],
  "skippedRegions": [
    { "imageIndex": 0, "boundingBox": { "x": 0.1, "y": 0.4, "width": 0.8, "height": 0.05 } }
  ]
}`

export async function parseReceipt(files: File[]): Promise<ParseReceiptResult> {
  // Mock mode — no API call
  if (import.meta.env.VITE_MOCK_MODE === 'true') {
    return { items: MOCK_ITEMS, skippedRegions: [] }
  }

  const client = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  // Build image blocks for each file
  const imageBlocks = await Promise.all(
    files.map(async (file) => {
      const base64 = await fileToBase64(file)
      // Normalize HEIC → jpeg for API (API does not accept heic media type)
      const mediaType = (file.type === 'image/heic' || file.type === 'image/heif')
        ? 'image/jpeg'
        : (file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp')
      return {
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: mediaType, data: base64 },
      }
    })
  )

  let responseText: string
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            { type: 'text', text: 'Extract all line items from this receipt.' },
          ],
        },
      ],
    })
    const block = response.content[0]
    if (block.type !== 'text') {
      throw new Error('Unexpected response type from AI')
    }
    responseText = block.text
  } catch (err) {
    // Re-throw already-formatted errors (e.g., "Could not..." messages we threw ourselves)
    if (err instanceof Error && err.message.startsWith('Could not')) {
      throw err
    }
    throw new Error('Could not reach the AI service. Check your connection and try again.')
  }

  // Parse JSON response
  let parsed: { items?: unknown[]; skippedRegions?: unknown[] }
  try {
    parsed = JSON.parse(responseText)
  } catch {
    throw new Error('AI returned an unreadable response. Please try again.')
  }

  if (!Array.isArray(parsed.items)) {
    throw new Error('AI returned an unreadable response. Please try again.')
  }

  // Normalize and filter items — exclude Subtotal/Total
  const EXCLUDED_NAMES = new Set(['subtotal', 'total'])
  const items: ReceiptItem[] = (parsed.items as Array<{ name?: unknown; price?: unknown }>)
    .filter((item) => {
      const name = String(item.name ?? '').trim()
      return name !== '' && !EXCLUDED_NAMES.has(name.toLowerCase())
    })
    .map((item) => ({
      name: String(item.name).trim(),
      price: Number(item.price),
    }))

  const skippedRegions = Array.isArray(parsed.skippedRegions)
    ? (parsed.skippedRegions as ParseReceiptResult['skippedRegions'])
    : []

  return { items, skippedRegions }
}
