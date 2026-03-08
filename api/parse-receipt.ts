import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a receipt parser. Extract line items from receipt images.

Rules:
- Return ONLY a JSON object, no prose, no markdown code fences
- If the image is not a receipt or no items can be identified, return {"items": [], "skippedRegions": []}
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

// Vercel serverless function — ANTHROPIC_API_KEY is a server-side secret (no VITE_ prefix)
// req.body is auto-parsed by Vercel for application/json requests
export default async function handler(
  req: { method: string; body: { images?: Array<{ base64: string; mediaType: string }> } },
  res: { status: (code: number) => { json: (data: unknown) => void }; json: (data: unknown) => void },
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { images } = req.body ?? {}
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'No images provided' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[parse-receipt] ANTHROPIC_API_KEY is not set')
    return res.status(500).json({ error: 'API not configured' })
  }

  console.log('[parse-receipt] Starting Anthropic call, images:', images.length)

  try {
    const client = new Anthropic({ apiKey })

    const validTypes = new Set<string>(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
    const imageBlocks = images.map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: (validTypes.has(img.mediaType) ? img.mediaType : 'image/jpeg') as
          | 'image/jpeg'
          | 'image/png'
          | 'image/gif'
          | 'image/webp',
        data: img.base64 ?? '',
      },
    }))

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [...imageBlocks, { type: 'text', text: 'Extract all line items from this receipt.' }],
        },
      ],
    })

    const block = response.content[0]
    if (block.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response type from AI' })
    }

    const parsed = JSON.parse(block.text) as { items?: unknown; skippedRegions?: unknown }
    if (!Array.isArray(parsed.items)) {
      return res.status(500).json({ error: 'Could not read the receipt. Try a clearer photo and try again.' })
    }

    return res.json({
      items: parsed.items,
      skippedRegions: Array.isArray(parsed.skippedRegions) ? parsed.skippedRegions : [],
    })
  } catch (err) {
    console.error('[parse-receipt] Error:', err)
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Could not read the receipt. Try a clearer photo and try again.' })
    }
    const message = err instanceof Error ? err.message : String(err)
    return res.status(500).json({
      error: `Server error: ${message}`,
    })
  }
}
