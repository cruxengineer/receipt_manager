/**
 * TDD tests for parseReceipt service.
 * RED: All tests written before implementation. They must fail initially.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ParseReceiptResult, ReceiptItem } from '@/types/ai'

// Mock the Anthropic SDK before importing parseReceipt
vi.mock('@anthropic-ai/sdk', () => {
  const mockCreate = vi.fn()
  const MockAnthropic = vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }))
  // Attach mockCreate so tests can reference it via the constructor mock
  ;(MockAnthropic as unknown as Record<string, unknown>)._mockCreate = mockCreate
  return { default: MockAnthropic }
})

// Helper: Create a minimal File object
function makeFile(name = 'receipt.jpg', type = 'image/jpeg'): File {
  return new File(['fake-image-data'], name, { type })
}

// Helper: Build a stubbed Anthropic text response
function makeAnthropicResponse(json: object): object {
  return {
    content: [{ type: 'text', text: JSON.stringify(json) }],
  }
}

describe('parseReceipt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('Test 3 (mock no API call): Anthropic SDK is never instantiated in mock mode', async () => {
    vi.stubEnv('VITE_MOCK_MODE', 'true')
    const AnthropicModule = await import('@anthropic-ai/sdk')
    const MockAnthropic = AnthropicModule.default as ReturnType<typeof vi.fn>
    MockAnthropic.mockClear()

    const { parseReceipt } = await import('./parseReceipt')
    await parseReceipt([makeFile()])

    expect(MockAnthropic).not.toHaveBeenCalled()
  })

  // ──────────────────────────────────────────────
  // Real API tests (VITE_MOCK_MODE unset/falsy)
  // ──────────────────────────────────────────────

  it('Test 4 (real API success): calls Anthropic with claude-3-5-sonnet-20241022 and image blocks', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    const AnthropicModule = await import('@anthropic-ai/sdk')
    const MockAnthropic = AnthropicModule.default as ReturnType<typeof vi.fn>
    const mockCreate = (MockAnthropic as unknown as Record<string, unknown>)._mockCreate as ReturnType<typeof vi.fn>
    mockCreate.mockResolvedValueOnce(
      makeAnthropicResponse({ items: [{ name: 'Pizza', price: 12.0 }], skippedRegions: [] })
    )

    const { parseReceipt } = await import('./parseReceipt')
    const result = await parseReceipt([makeFile()])

    expect(MockAnthropic).toHaveBeenCalled()
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-3-5-sonnet-20241022',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.arrayContaining([
              expect.objectContaining({ type: 'image' }),
            ]),
          }),
        ]),
      })
    )
    expect(result.items).toEqual([{ name: 'Pizza', price: 12.0 }])
  })

  it('Test 5 (real API response parsing): returns correct name and price from stubbed response', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    const AnthropicModule = await import('@anthropic-ai/sdk')
    const MockAnthropic = AnthropicModule.default as ReturnType<typeof vi.fn>
    const mockCreate = (MockAnthropic as unknown as Record<string, unknown>)._mockCreate as ReturnType<typeof vi.fn>
    mockCreate.mockResolvedValueOnce(
      makeAnthropicResponse({
        items: [
          { name: 'Burger', price: 10.5 },
          { name: 'Fries', price: 3.25 },
        ],
        skippedRegions: [],
      })
    )

    const { parseReceipt } = await import('./parseReceipt')
    const result = await parseReceipt([makeFile()])

    expect(result.items).toEqual<ReceiptItem[]>([
      { name: 'Burger', price: 10.5 },
      { name: 'Fries', price: 3.25 },
    ])
  })

  it('Test 6 (subtotal/total excluded): filters Subtotal and Total from returned items', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    const AnthropicModule = await import('@anthropic-ai/sdk')
    const MockAnthropic = AnthropicModule.default as ReturnType<typeof vi.fn>
    const mockCreate = (MockAnthropic as unknown as Record<string, unknown>)._mockCreate as ReturnType<typeof vi.fn>
    mockCreate.mockResolvedValueOnce(
      makeAnthropicResponse({
        items: [
          { name: 'Coffee', price: 4.0 },
          { name: 'Subtotal', price: 4.0 },
          { name: 'Total', price: 4.0 },
        ],
        skippedRegions: [],
      })
    )

    const { parseReceipt } = await import('./parseReceipt')
    const result = await parseReceipt([makeFile()])

    const names = result.items.map((i) => i.name.toLowerCase())
    expect(names).not.toContain('subtotal')
    expect(names).not.toContain('total')
    expect(result.items).toHaveLength(1)
    expect(result.items[0].name).toBe('Coffee')
  })

  it('Test 7 (skipped regions): returns skippedRegions from AI response', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    const AnthropicModule = await import('@anthropic-ai/sdk')
    const MockAnthropic = AnthropicModule.default as ReturnType<typeof vi.fn>
    const mockCreate = (MockAnthropic as unknown as Record<string, unknown>)._mockCreate as ReturnType<typeof vi.fn>
    const skipped = [{ imageIndex: 0, boundingBox: { x: 0.1, y: 0.4, width: 0.8, height: 0.05 } }]
    mockCreate.mockResolvedValueOnce(
      makeAnthropicResponse({ items: [], skippedRegions: skipped })
    )

    const { parseReceipt } = await import('./parseReceipt')
    const result = await parseReceipt([makeFile()])

    expect(result.skippedRegions).toEqual(skipped)
  })

  it('Test 8 (API error): throws Error with user-readable message when SDK throws', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    const AnthropicModule = await import('@anthropic-ai/sdk')
    const MockAnthropic = AnthropicModule.default as ReturnType<typeof vi.fn>
    const mockCreate = (MockAnthropic as unknown as Record<string, unknown>)._mockCreate as ReturnType<typeof vi.fn>
    mockCreate.mockRejectedValueOnce(new Error('Network failure'))

    const { parseReceipt } = await import('./parseReceipt')

    await expect(parseReceipt([makeFile()])).rejects.toThrow(
      'Could not reach the AI service. Check your connection and try again.'
    )
  })

  it('Test 9 (invalid JSON in response): throws Error with user-readable message when AI returns non-JSON', async () => {
    vi.stubEnv('VITE_MOCK_MODE', '')
    const AnthropicModule = await import('@anthropic-ai/sdk')
    const MockAnthropic = AnthropicModule.default as ReturnType<typeof vi.fn>
    const mockCreate = (MockAnthropic as unknown as Record<string, unknown>)._mockCreate as ReturnType<typeof vi.fn>
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Sorry, I cannot read that receipt.' }],
    })

    const { parseReceipt } = await import('./parseReceipt')

    await expect(parseReceipt([makeFile()])).rejects.toThrow(
      'AI returned an unreadable response. Please try again.'
    )
  })
})
