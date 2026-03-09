import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SwipeAssignments } from '@/types/swipe'

interface SummaryScreenProps {
  assignments: SwipeAssignments
  personAName: string
  personBName: string
  onAdjust: () => void
  onStartOver: () => void
  onEditNames: () => void
}

export function SummaryScreen({
  assignments,
  personAName,
  personBName,
  onAdjust,
  onStartOver,
  onEditNames,
}: SummaryScreenProps) {
  // Derive item lists
  const itemsA = assignments.filter(a => a.assignee === 'A' || a.assignee === 'split')
  const itemsB = assignments.filter(a => a.assignee === 'B' || a.assignee === 'split')

  // Derive totals
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

  const receiptTotal = totalA + totalB

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* Totals bar — matches SwipeScreen pattern */}
        <div className="flex justify-around px-6 py-2.5 bg-white border-b border-gray-100 flex-shrink-0 pt-safe">
          <div className="text-center" style={{ color: 'var(--color-person-a)' }}>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xs font-semibold tracking-wide">{personAName}</span>
              <button
                onClick={onEditNames}
                aria-label="edit names"
                className="opacity-50 hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
            <div className="text-xl font-bold">${totalA.toFixed(2)}</div>
          </div>
          <div className="w-px bg-gray-100 self-stretch" />
          <div className="text-center" style={{ color: 'var(--color-person-b)' }}>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xs font-semibold tracking-wide">{personBName}</span>
              <button
                onClick={onEditNames}
                aria-label="edit names"
                className="opacity-50 hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
            <div className="text-xl font-bold">${totalB.toFixed(2)}</div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-6">

          {/* Person A section */}
          <div>
            <h2
              className="text-sm font-bold tracking-wide uppercase mb-2"
              style={{ color: 'var(--color-person-a)' }}
            >
              {personAName}
            </h2>
            <ul className="space-y-2">
              {itemsA.map((a, i) => (
                <li key={i} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-sm text-gray-800">
                    {a.item.name}
                    {a.assignee === 'split' && (
                      <span className="text-xs text-gray-400 ml-1">Split ½</span>
                    )}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${(a.assignee === 'split' ? a.item.price / 2 : a.item.price).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Person B section */}
          <div>
            <h2
              className="text-sm font-bold tracking-wide uppercase mb-2"
              style={{ color: 'var(--color-person-b)' }}
            >
              {personBName}
            </h2>
            <ul className="space-y-2">
              {itemsB.map((a, i) => (
                <li key={i} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-sm text-gray-800">
                    {a.item.name}
                    {a.assignee === 'split' && (
                      <span className="text-xs text-gray-400 ml-1">Split ½</span>
                    )}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${(a.assignee === 'split' ? a.item.price / 2 : a.item.price).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Receipt total sanity line */}
          <div className="flex justify-between items-center px-3 py-2 border-t border-gray-200 text-sm text-gray-500">
            <span>Receipt total</span>
            <span className="font-semibold">${receiptTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Bottom action row */}
        <div className="flex gap-3 px-4 pt-3 bg-gray-50 flex-shrink-0 pb-safe-6">
          <Button
            className="flex-1 h-11"
            onClick={onAdjust}
          >
            Adjust
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={onStartOver}
          >
            Start Over
          </Button>
        </div>

      </div>
    </div>
  )
}
