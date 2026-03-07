import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useSwipeGesture } from './useSwipeGesture'

describe('useSwipeGesture', () => {
  it('returns initial state on mount', () => {
    const { result } = renderHook(() => useSwipeGesture())
    expect(result.current.dragX).toBe(0)
    expect(result.current.rotation).toBe(0)
    expect(result.current.tintOpacity).toBe(0)
    expect(result.current.committed).toBe(false)
    expect(result.current.direction).toBeNull()
  })

  it('tracks drag to -60px with threshold 120 (partial drag left)', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 120 }))
    act(() => {
      result.current.handlers.onPointerDown({ clientX: 200, pointerId: 1, currentTarget: { setPointerCapture: () => {} } } as unknown as React.PointerEvent)
    })
    act(() => {
      result.current.handlers.onPointerMove({ clientX: 140, pointerId: 1 } as unknown as React.PointerEvent)
    })
    expect(result.current.dragX).toBeCloseTo(-60)
    expect(result.current.rotation).toBeCloseTo(-7.5)
    expect(result.current.tintOpacity).toBeCloseTo(0.5)
    expect(result.current.committed).toBe(false)
    expect(result.current.direction).toBeNull()
  })

  it('tracks drag to +60px with threshold 120 (partial drag right)', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 120 }))
    act(() => {
      result.current.handlers.onPointerDown({ clientX: 200, pointerId: 1, currentTarget: { setPointerCapture: () => {} } } as unknown as React.PointerEvent)
    })
    act(() => {
      result.current.handlers.onPointerMove({ clientX: 260, pointerId: 1 } as unknown as React.PointerEvent)
    })
    expect(result.current.dragX).toBeCloseTo(60)
    expect(result.current.rotation).toBeCloseTo(7.5)
    expect(result.current.tintOpacity).toBeCloseTo(0.5)
    expect(result.current.committed).toBe(false)
    expect(result.current.direction).toBeNull()
  })

  it('commits left at threshold (-120px)', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 120 }))
    act(() => {
      result.current.handlers.onPointerDown({ clientX: 200, pointerId: 1, currentTarget: { setPointerCapture: () => {} } } as unknown as React.PointerEvent)
    })
    act(() => {
      result.current.handlers.onPointerMove({ clientX: 80, pointerId: 1 } as unknown as React.PointerEvent)
    })
    expect(result.current.dragX).toBeCloseTo(-120)
    expect(result.current.committed).toBe(true)
    expect(result.current.direction).toBe('left')
    expect(result.current.tintOpacity).toBe(1)
  })

  it('commits right past threshold (+130px)', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 120 }))
    act(() => {
      result.current.handlers.onPointerDown({ clientX: 200, pointerId: 1, currentTarget: { setPointerCapture: () => {} } } as unknown as React.PointerEvent)
    })
    act(() => {
      result.current.handlers.onPointerMove({ clientX: 330, pointerId: 1 } as unknown as React.PointerEvent)
    })
    expect(result.current.committed).toBe(true)
    expect(result.current.direction).toBe('right')
  })

  it('snaps back to 0 on release below threshold', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 120 }))
    act(() => {
      result.current.handlers.onPointerDown({ clientX: 200, pointerId: 1, currentTarget: { setPointerCapture: () => {} } } as unknown as React.PointerEvent)
    })
    act(() => {
      result.current.handlers.onPointerMove({ clientX: 150, pointerId: 1 } as unknown as React.PointerEvent)
    })
    // Drag is at -50, below threshold, so release should snap back
    act(() => {
      result.current.handlers.onPointerUp({ clientX: 150, pointerId: 1 } as unknown as React.PointerEvent)
    })
    expect(result.current.dragX).toBe(0)
    expect(result.current.committed).toBe(false)
  })

  it('does NOT snap back after commit on release', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 120 }))
    act(() => {
      result.current.handlers.onPointerDown({ clientX: 200, pointerId: 1, currentTarget: { setPointerCapture: () => {} } } as unknown as React.PointerEvent)
    })
    act(() => {
      result.current.handlers.onPointerMove({ clientX: 70, pointerId: 1 } as unknown as React.PointerEvent)
    })
    // Drag is at -130, past threshold
    act(() => {
      result.current.handlers.onPointerUp({ clientX: 70, pointerId: 1 } as unknown as React.PointerEvent)
    })
    // dragX should NOT have reset — remains at committed value
    expect(result.current.committed).toBe(true)
    expect(result.current.dragX).not.toBe(0)
  })

  it('reset() returns all values to initial state', () => {
    const { result } = renderHook(() => useSwipeGesture({ threshold: 120 }))
    act(() => {
      result.current.handlers.onPointerDown({ clientX: 200, pointerId: 1, currentTarget: { setPointerCapture: () => {} } } as unknown as React.PointerEvent)
    })
    act(() => {
      result.current.handlers.onPointerMove({ clientX: 70, pointerId: 1 } as unknown as React.PointerEvent)
    })
    act(() => {
      result.current.handlers.onPointerUp({ clientX: 70, pointerId: 1 } as unknown as React.PointerEvent)
    })
    expect(result.current.committed).toBe(true)
    // Now call reset
    act(() => {
      result.current.reset()
    })
    expect(result.current.dragX).toBe(0)
    expect(result.current.rotation).toBe(0)
    expect(result.current.tintOpacity).toBe(0)
    expect(result.current.committed).toBe(false)
    expect(result.current.direction).toBeNull()
  })
})
