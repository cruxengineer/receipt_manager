import { useState, useRef, useCallback } from 'react'

interface UseSwipeGestureOptions {
  threshold?: number // px before commit fires; default 160
}

interface UseSwipeGestureReturn {
  dragX: number // current drag offset in px
  rotation: number // degrees; max ~15 at threshold
  tintOpacity: number // 0..1 scaled to threshold
  direction: 'left' | 'right' | null // null when not committed
  committed: boolean // true when |dragX| >= threshold
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerCancel: (e: React.PointerEvent) => void
  }
  reset: () => void // call after card flies off
}

export function useSwipeGesture(options?: UseSwipeGestureOptions): UseSwipeGestureReturn {
  const threshold = options?.threshold ?? 160

  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Use refs to avoid stale closures in handlers
  const startXRef = useRef(0)
  const dragXRef = useRef(0) // mirrors dragX state for use in handlers

  // Derived values — computed directly in render body
  const committed = Math.abs(dragX) >= threshold
  const rotation = Math.min(Math.max((dragX / threshold) * 15, -15), 15)
  const tintOpacity = Math.min(Math.abs(dragX) / threshold, 1)
  const direction: 'left' | 'right' | null = committed ? (dragX < 0 ? 'left' : 'right') : null

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      startXRef.current = e.clientX
      dragXRef.current = 0
      setDragX(0)
      setIsDragging(true)
      // setPointerCapture ensures pointerMove fires even outside element (critical for mobile)
      try {
        e.currentTarget?.setPointerCapture?.(e.pointerId)
      } catch {
        // jsdom does not implement setPointerCapture — safe to ignore in tests
      }
    },
    []
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const newDragX = e.clientX - startXRef.current
      dragXRef.current = newDragX
      setDragX(newDragX)
    },
    [isDragging]
  )

  const onPointerUp = useCallback(
    (_e: React.PointerEvent) => {
      setIsDragging(false)
      const currentDragX = dragXRef.current
      const isCommitted = Math.abs(currentDragX) >= threshold
      if (!isCommitted) {
        // Snap back
        dragXRef.current = 0
        setDragX(0)
      }
      // If committed: leave dragX as-is, let SwipeScreen call reset() after fly-off animation
    },
    [threshold]
  )

  const onPointerCancel = useCallback(
    (_e: React.PointerEvent) => {
      setIsDragging(false)
      // Always snap back on cancel
      dragXRef.current = 0
      setDragX(0)
    },
    []
  )

  const reset = useCallback(() => {
    dragXRef.current = 0
    setDragX(0)
    setIsDragging(false)
  }, [])

  return {
    dragX,
    rotation,
    tintOpacity,
    direction,
    committed,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    reset,
  }
}
