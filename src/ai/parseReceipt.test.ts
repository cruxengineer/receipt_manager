/**
 * Tests for parseReceipt service.
 * Real-API tests mock fetch (/api/parse-receipt) instead of @anthropic-ai/sdk
 * since the API key is now a server-side secret.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ParseReceiptResult, ReceiptItem } from '@/types/ai'

function makeFile(name = 'receipt.jpg', type = 'image/jpeg'): File {
  return new File(['fake-image-data'], name, { type })
}

function mockFetchOk(result: object) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(result),
    }),
  )
}

function mockFetchError(status: number, error: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValueOnce({
      ok: false,
      status,
      json: () => Promise.resolve({ error }),
    }),
  )
}

describe('parseReceipt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  // ──────────────────────────────────────────────
  // Mock mode tests (VITE_MOCK_MODE = 'true')
  // ──────────────────────────────────────────────

  it('Test 1 (mock mode): resolves with at least 3 items and empty skippedRegions', async () => {
    vi.stubEnv('VITE_MOCK_MODE', 'true')
    const { parseReceipt } = await import('./parseReceipt')

    const result: ParseReceiptResult = await parseReceipt([makeFile()])

    expect(result.items.length).toBeGreaterThanOrEqual(3)
    expect(result.skippedRegions).toEqual([])
  })

  it('Test 2 (mock schema): every mock item has a non-empty name and positive price', async () => {
    vi.stubEnv('VITE_MOCK_MODE', 'true')
    const { parseReceipt } = await import('./parseReceipt')

    const result: ParseReceiptResult = await parseReceipt([makeFile()])

    for (const item of result.items) {
      expect(typeof item.name).toBe('string')
      expect(item.name.trim().length).toBeGreaterThan(0)
      expect(typeof item.price).toBe('number')
      expect(item.price).toBeGreaterThan(0)
    }
  })

  it('Test 3 (mock no API call): fetch is never called in mock mode', async () => {
    vi.stubEnv('VITE_MOCK_MODE', 'true')
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
    const { parseReceipt } = await import('./parseReceipt')

    await parseReceipt([makeFile()])

    expect(mockFetch).not.toHaveBeenCalled()
  })

  // ──────────────────────────────────────────────
  // Real API tests (fetch-based, VITE_MOCK_MODE unset/falsy)
  // ──────────────────────────────────────────────

  it('Test 4 (real API success): POSTs to /api/parse-receipt with base64 image data', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    mockFetchOk({ items: [{ name: 'Pizza', price: 12.0 }], skippedRegions: [] })

    const { parseReceipt } = await import('./parseReceipt')
    const result = await parseReceipt([makeFile()])

    expect(fetch).toHaveBeenCalledWith(
      '/api/parse-receipt',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(result.items).toEqual([{ name: 'Pizza', price: 12.0 }])
  })

  it('Test 5 (real API response parsing): returns correct name and price from server response', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    mockFetchOk({
      items: [
        { name: 'Burger', price: 10.5 },
        { name: 'Fries', price: 3.25 },
      ],
      skippedRegions: [],
    })

    const { parseReceipt } = await import('./parseReceipt')
    const result = await parseReceipt([makeFile()])

    expect(result.items).toEqual<ReceiptItem[]>([
      { name: 'Burger', price: 10.5 },
      { name: 'Fries', price: 3.25 },
    ])
  })

  it('Test 6 (subtotal/total excluded): client filters Subtotal and Total from server response', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    mockFetchOk({
      items: [
        { name: 'Coffee', price: 4.0 },
        { name: 'Subtotal', price: 4.0 },
        { name: 'Total', price: 4.0 },
      ],
      skippedRegions: [],
    })

    const { parseReceipt } = await import('./parseReceipt')
    const result = await parseReceipt([makeFile()])

    const names = result.items.map((i) => i.name.toLowerCase())
    expect(names).not.toContain('subtotal')
    expect(names).not.toContain('total')
    expect(result.items).toHaveLength(1)
    expect(result.items[0].name).toBe('Coffee')
  })

  it('Test 7 (skipped regions): returns skippedRegions from server response', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    const skipped = [{ imageIndex: 0, boundingBox: { x: 0.1, y: 0.4, width: 0.8, height: 0.05 } }]
    mockFetchOk({ items: [], skippedRegions: skipped })

    const { parseReceipt } = await import('./parseReceipt')
    const result = await parseReceipt([makeFile()])

    expect(result.skippedRegions).toEqual(skipped)
  })

  it('Test 8 (network error): throws user-readable error when fetch throws', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network failure')))

    const { parseReceipt } = await import('./parseReceipt')

    await expect(parseReceipt([makeFile()])).rejects.toThrow(
      'Could not reach the AI service. Check your connection and try again.',
    )
  })

  it('Test 9 (server error): throws error message from server error response', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    mockFetchError(500, 'AI returned an unreadable response. Please try again.')

    const { parseReceipt } = await import('./parseReceipt')

    await expect(parseReceipt([makeFile()])).rejects.toThrow(
      'AI returned an unreadable response. Please try again.',
    )
  })
})
