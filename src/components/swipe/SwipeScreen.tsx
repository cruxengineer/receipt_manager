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

  const gesture = useSwipeGesture()

  const currentItem = items[currentIndex]

  // Derived running totals
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
        // Render "All done!" immediately, then notify parent after 1500ms
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

  // Wire committed gesture to handleAssign
  useEffect(() => {
    if (gesture.committed) {
      const dir = gesture.direction
      if (dir === 'left') handleAssign('A')
      else if (dir === 'right') handleAssign('B')
      setTimeout(() => gesture.reset(), 50)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gesture.committed])

  if (allDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-900">All done!</p>
        </div>
      </div>
    )
  }

  const isFirstCard = currentIndex === 0 && assignments.length === 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 relative">

        {/* Top bar: back + progress + three-dots */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentIndex === 0 && assignments.length === 0}
            aria-label="back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-500">
            Item {currentIndex + 1} of {items.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="menu"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Three-dots dropdown menu */}
        {menuOpen && (
          <div className="absolute top-14 right-4 bg-white rounded-lg shadow-md border border-gray-100 z-10">
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
        <div className="flex justify-around px-4 py-2 bg-white border-b border-gray-100">
          <div
            className="text-center"
            style={{ color: 'var(--color-person-a)' }}
          >
            <div className="text-xs font-medium">{personAName}</div>
            <div className="text-lg font-bold">${totalA.toFixed(2)}</div>
          </div>
          <div
            className="text-center"
            style={{ color: 'var(--color-person-b)' }}
          >
            <div className="text-xs font-medium">{personBName}</div>
            <div className="text-lg font-bold">${totalB.toFixed(2)}</div>
          </div>
        </div>

        {/* Card area — dominant element */}
        <div className="flex-1 flex items-center justify-center px-6 relative">
          {/* Color tint background (fades in behind card) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor:
                gesture.direction === 'left' || gesture.dragX < 0
                  ? 'var(--color-person-a-light)'
                  : 'var(--color-person-b-light)',
              opacity: gesture.tintOpacity,
            }}
          />

          {/* Item card */}
          <div
            className="relative bg-white rounded-2xl shadow-lg p-8 w-full touch-none select-none"
            style={{
              transform: `translateX(${gesture.dragX}px) rotate(${gesture.rotation}deg)`,
              transition: gesture.dragX === 0 ? 'transform 0.3s ease' : 'none',
            }}
            {...gesture.handlers}
          >
            {/* Directional label */}
            {gesture.tintOpacity > 0.1 && (
              <div
                className="absolute top-4 font-bold text-lg"
                style={{
                  color: gesture.dragX < 0 ? 'var(--color-person-a)' : 'var(--color-person-b)',
                  left: gesture.dragX < 0 ? '1rem' : undefined,
                  right: gesture.dragX >= 0 ? '1rem' : undefined,
                  opacity: gesture.tintOpacity,
                }}
              >
                {gesture.dragX < 0 ? personAName : personBName}
              </div>
            )}

            <div className="text-center mt-4">
              <p className="text-xl font-semibold text-gray-900">{currentItem.name}</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                ${currentItem.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Split button + hint */}
        <div className="px-6 pb-6 flex flex-col items-center gap-3">
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => handleAssign('split')}
            aria-label="Split equally"
          >
            Split equally
          </Button>
          {isFirstCard && (
            <p className="text-sm text-gray-400">
              ← {personAName} · Split · {personBName} →
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
