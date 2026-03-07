import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SkippedRegionCrop } from './SkippedRegionCrop'

// Mock URL object methods
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

// Mock canvas context
const mockDrawImage = vi.fn()
const mockGetContext = vi.fn(() => ({
  drawImage: mockDrawImage,
}))

// Mock HTMLImageElement so we can control onload manually
let imageOnloadCallback: (() => void) | null = null

class MockImage {
  naturalWidth = 1000
  naturalHeight = 2000
  src = ''
  onload: (() => void) | null = null

  set onloadHandler(fn: () => void) {
    this.onload = fn
    imageOnloadCallback = fn
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  imageOnloadCallback = null

  // Install URL mocks
  Object.defineProperty(globalThis, 'URL', {
    value: {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    },
    writable: true,
    configurable: true,
  })

  // Mock HTMLImageElement — must use function (not arrow) so it works as a constructor
  vi.spyOn(globalThis, 'Image').mockImplementation(function () {
    const img = new MockImage()
    // Proxy the onload setter to capture the callback
    return new Proxy(img, {
      set(target, prop, value) {
        if (prop === 'onload') {
          imageOnloadCallback = value as () => void
          target.onload = value as () => void
        } else if (prop === 'src') {
          target.src = value as string
          // Auto-trigger onload after src is set (simulate image load)
          if (imageOnloadCallback) {
            const cb = imageOnloadCallback
            Promise.resolve().then(() => cb())
          }
        } else {
          ;(target as unknown as Record<string, unknown>)[prop as string] = value
        }
        return true
      },
    }) as unknown as HTMLImageElement
  } as unknown as typeof Image)

  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext
})

afterEach(() => {
  vi.restoreAllMocks()
})

const makeFakeFile = (name = 'receipt.jpg') =>
  new File(['fake-image-data'], name, { type: 'image/jpeg' })

const boundingBox = { x: 0.1, y: 0.2, width: 0.5, height: 0.3 }

describe('SkippedRegionCrop', () => {
  it('Test 1: renders a canvas element', () => {
    const { container } = render(
      <SkippedRegionCrop file={makeFakeFile()} boundingBox={boundingBox} />
    )
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
  })

  it('Test 2: calls drawImage with correct crop coordinates after image loads', async () => {
    render(
      <SkippedRegionCrop file={makeFakeFile()} boundingBox={boundingBox} />
    )

    // Wait for async onload to fire
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockDrawImage).toHaveBeenCalledTimes(1)

    const call = mockDrawImage.mock.calls[0]
    // drawImage(img, srcX, srcY, srcW, srcH, 0, 0, destW, destH)
    // naturalWidth=1000, naturalHeight=2000
    // srcX = 0.1 * 1000 = 100
    // srcY = 0.2 * 2000 = 400
    // srcW = 0.5 * 1000 = 500
    // srcH = 0.3 * 2000 = 600
    expect(call[1]).toBe(100) // srcX
    expect(call[2]).toBe(400) // srcY
    expect(call[3]).toBe(500) // srcW
    expect(call[4]).toBe(600) // srcH
  })

  it('Test 3: sets canvas dimensions to the pixel crop size, clamped to max 320px wide', async () => {
    const { container } = render(
      <SkippedRegionCrop file={makeFakeFile()} boundingBox={boundingBox} />
    )

    await act(async () => {
      await Promise.resolve()
    })

    const canvas = container.querySelector('canvas')!

    // srcW = 500, srcH = 600 — srcW > 320, so scale = 320/500 = 0.64
    // destW = Math.round(500 * 0.64) = 320
    // destH = Math.round(600 * 0.64) = 384
    expect(canvas.width).toBe(320)
    expect(canvas.height).toBe(384)
  })

  it('Test 3b: canvas uses natural dimensions when crop is narrow (no clamping)', async () => {
    // boundingBox width fraction 0.2 → srcW = 0.2 * 1000 = 200 < 320, no clamping
    const narrowBox = { x: 0.1, y: 0.2, width: 0.2, height: 0.1 }
    const { container } = render(
      <SkippedRegionCrop file={makeFakeFile()} boundingBox={narrowBox} />
    )

    await act(async () => {
      await Promise.resolve()
    })

    const canvas = container.querySelector('canvas')!
    // srcW = 200, srcH = 200 — no clamping, scale = 1
    expect(canvas.width).toBe(200)
    expect(canvas.height).toBe(200)
  })

  it('Test 4: URL.createObjectURL called with the file; URL.revokeObjectURL called on unmount', async () => {
    const file = makeFakeFile('test-receipt.jpg')
    const { unmount } = render(
      <SkippedRegionCrop file={file} boundingBox={boundingBox} />
    )

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockCreateObjectURL).toHaveBeenCalledWith(file)

    // Before unmount, revokeObjectURL should NOT be called
    expect(mockRevokeObjectURL).not.toHaveBeenCalled()

    unmount()

    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
