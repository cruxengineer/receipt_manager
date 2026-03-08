import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, MoreHorizontal, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import type { ReceiptItem } from '@/types/ai'
import type { ItemAssignment, SwipeAssignments } from '@/types/swipe'

interface SwipeScreenProps {
  items: ReceiptItem[]
  personAName: string
  personBName: string
  onComplete: (assignments: SwipeAssignments) => void
}

export function SwipeScreen({ items, personAName, personBName, onComplete }: SwipeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [assignments, setAssignments] = useState<ItemAssignment[]>([])
  const [allDone, setAllDone] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isFlyingOut, setIsFlyingOut] = useState<'left' | 'right' | null>(null)
  const [splitFlash, setSplitFlash] = useState(false)

  const gesture = useSwipeGesture()

  const currentItem = items[currentIndex]

  const totalA = assignments.reduce((sum, a) => {
    if (a.assignee === 'A') return sum + a.item.price
    if (a.assignee === 'split') return sum + a.item.price / 2
    return sum
  }, 0)

  const totalB = assignments.reduce((sum, a) => {
    if (a.assignee === 'B') return sum + a.item.price
    if (a.assignee === 'split') return sum + a.item.price / 2
    return sum
  }, 0)

  const handleAssign = useCallback(
    (assignee: 'A' | 'B' | 'split') => {
      const newAssignment: ItemAssignment = { item: currentItem, assignee }
      const newAssignments = [...assignments, newAssignment]
      setAssignments(newAssignments)
      if (currentIndex === items.length - 1) {
        setAllDone(true)
        setTimeout(() => onComplete(newAssignments), 1500)
      } else {
        setCurrentIndex(i => i + 1)
      }
    },
    [currentItem, assignments, currentIndex, items.length, onComplete]
  )

  const handleBack = () => {
    if (currentIndex > 0 || assignments.length > 0) {
      setAssignments(prev => prev.slice(0, -1))
      setCurrentIndex(i => Math.max(0, i - 1))
    }
  }

  const handleSplitClick = () => {
    setSplitFlash(true)
    setTimeout(() => setSplitFlash(false), 500)
    handleAssign('split')
  }

  // Wire committed gesture → fly-off animation → assign
  useEffect(() => {
    if (gesture.committed && !isFlyingOut) {
      const dir = gesture.direction
      if (!dir) return
      setIsFlyingOut(dir)
      setTimeout(() => {
        if (dir === 'left') handleAssign('A')
        else if (dir === 'right') handleAssign('B')
        setIsFlyingOut(null)
        gesture.reset()
      }, 320)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gesture.committed])

  if (allDone) {
    return (
      <div className="h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-900">All done!</p>
        </div>
      </div>
    )
  }

  const isFirstCard = currentIndex === 0 && assignments.length === 0

  // Card transform: fly-off overrides gesture drag
  const cardTransform = isFlyingOut === 'left'
    ? 'translateX(-120vw) rotate(-28deg)'
    : isFlyingOut === 'right'
    ? 'translateX(120vw) rotate(28deg)'
    : `translateX(${gesture.dragX}px) rotate(${gesture.rotation}deg)`

  const cardTransition = isFlyingOut
    ? 'transform 0.32s ease-in'
    : gesture.dragX === 0 ? 'transform 0.3s ease' : 'none'

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 relative min-h-0">

        {/* Top bar: back + progress + three-dots */}
        <div className="flex items-center justify-between px-3 pt-4 pb-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentIndex === 0 && assignments.length === 0}
            aria-label="back"
            className="min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-gray-500">
            Item {currentIndex + 1} of {items.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="menu"
            className="min-w-[44px] min-h-[44px]"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Three-dots dropdown */}
        {menuOpen && (
          <div className="absolute top-14 right-3 bg-white rounded-lg shadow-md border border-gray-100 z-10">
            <button
              className="block w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-gray-50 rounded-lg"
              onClick={() => {
                setMenuOpen(false)
                onComplete([])
              }}
            >
              Start over
            </button>
          </div>
        )}

        {/* Running totals bar */}
        <div className="flex justify-around px-6 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="text-center" style={{ color: 'var(--color-person-a)' }}>
            <div className="text-xs font-semibold tracking-wide">{personAName}</div>
            <div className="text-xl font-bold">${totalA.toFixed(2)}</div>
          </div>
          <div className="w-px bg-gray-100 self-stretch" />
          <div className="text-center" style={{ color: 'var(--color-person-b)' }}>
            <div className="text-xs font-semibold tracking-wide">{personBName}</div>
            <div className="text-xl font-bold">${totalB.toFixed(2)}</div>
          </div>
        </div>

        {/* Card area */}
        <div className="flex-1 flex items-center justify-center px-5 relative min-h-0">
          {/* Color tint background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor:
                isFlyingOut === 'left' || gesture.dragX < 0
                  ? 'var(--color-person-a-light)'
                  : 'var(--color-person-b-light)',
              opacity: isFlyingOut ? 0.25 : gesture.tintOpacity,
              transition: 'opacity 0.2s ease',
            }}
          />

          {/* Card wrapper — remounts per card, triggers enter animation */}
          <div
            key={currentIndex}
            className="w-full"
            style={{ animation: 'cardEnter 0.22s ease-out' }}
          >
            {/* Card inner — gesture transform and fly-off */}
            <div
              className="relative bg-white rounded-2xl shadow-lg p-8 w-full touch-none select-none"
              style={{ transform: cardTransform, transition: cardTransition }}
              {...gesture.handlers}
            >
              {/* Directional name label */}
              {gesture.tintOpacity > 0.08 && !isFlyingOut && (
                <div
                  className="absolute top-5 font-bold text-base"
                  style={{
                    color: gesture.dragX < 0 ? 'var(--color-person-a)' : 'var(--color-person-b)',
                    left: gesture.dragX < 0 ? '1.25rem' : undefined,
                    right: gesture.dragX >= 0 ? '1.25rem' : undefined,
                    opacity: gesture.tintOpacity,
                  }}
                >
                  {gesture.dragX < 0 ? personAName : personBName}
                </div>
              )}

              <div className="text-center py-4">
                <p className="text-xl font-semibold text-gray-700 leading-snug">
                  {currentItem.name}
                </p>
                <p className="text-5xl font-bold text-gray-900 mt-3">
                  ${currentItem.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hint + split button */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-8 flex-shrink-0">
          {isFirstCard && (
            <p className="text-xs text-gray-400 tracking-wide">
              ← {personAName} · Split · {personBName} →
            </p>
          )}
          <button
            onClick={handleSplitClick}
            aria-label="Split equally"
            className="w-20 h-20 rounded-full border border-gray-200 shadow-md flex flex-col items-center justify-center gap-0.5 active:scale-95"
            style={{
              backgroundColor: splitFlash ? 'var(--color-person-a-light)' : 'white',
              transition: 'background-color 0.4s ease, transform 0.1s ease',
            }}
          >
            <span className="text-sm font-semibold text-gray-700 leading-none">Split</span>
            <span className="text-xs text-gray-400 leading-none">50/50</span>
          </button>
        </div>

      </div>
    </div>
  )
}
