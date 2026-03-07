import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReceiptItem, SkippedRegion } from '@/types/ai'
import { SkippedRegionCrop } from './SkippedRegionCrop'

interface ReviewScreenProps {
  items: ReceiptItem[]
  skippedRegions: SkippedRegion[]
  /** Original uploaded receipt files — used to render canvas crops for skipped regions. */
  sourceFiles: File[]
  /** Called when user taps "Start splitting" with the final (possibly edited) item list */
  onConfirm: (items: ReceiptItem[]) => void
}

export function ReviewScreen({
  items,
  skippedRegions,
  sourceFiles,
  onConfirm,
}: ReviewScreenProps): JSX.Element {
  const [editedItems, setEditedItems] = useState<ReceiptItem[]>(() => [...items])
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')

  const handleRemove = (index: number) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAdd = () => {
    const trimmedName = newName.trim()
    const parsedPrice = parseFloat(newPrice)

    if (!trimmedName || isNaN(parsedPrice)) return

    setEditedItems((prev) => [...prev, { name: trimmedName, price: parsedPrice }])
    setNewName('')
    setNewPrice('')
  }

  const handleConfirm = () => {
    onConfirm(editedItems)
  }

  const skippedCount = skippedRegions.length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <header className="text-center py-6">
          <h1 className="text-2xl font-bold text-gray-900">Review Items</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {editedItems.length} item{editedItems.length !== 1 ? 's' : ''} extracted
          </p>
        </header>

        {/* Main card */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">

          {/* Skipped regions section */}
          {skippedCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-3">
              <p className="text-sm font-medium text-amber-800">
                {skippedCount} item{skippedCount !== 1 ? 's' : ''} couldn&apos;t be read — add them manually below
              </p>
              {skippedRegions.map((region, i) => {
                const file = sourceFiles[region.imageIndex]
                if (!file) return null
                return (
                  <SkippedRegionCrop
                    key={i}
                    file={file}
                    boundingBox={region.boundingBox}
                  />
                )
              })}
            </div>
          )}

          {/* Item list */}
          {editedItems.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {editedItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2 py-2">
                  <span className="flex-1 text-sm text-gray-900">{item.name}</span>
                  <span className="text-sm font-medium text-gray-700">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    aria-label={`Remove ${item.name}`}
                    className={cn(
                      'text-gray-400 hover:text-red-500 transition-colors',
                      'h-7 w-7 flex items-center justify-center rounded text-base leading-none'
                    )}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}

          {editedItems.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              No items yet — add them below.
            </p>
          )}

          {/* Add item form */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Item name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <input
              type="number"
              placeholder="Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-24 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              min="0"
              step="0.01"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAdd}
            >
              Add item
            </Button>
          </div>

          {/* Start splitting button */}
          <Button
            type="button"
            className="w-full"
            disabled={editedItems.length === 0}
            onClick={handleConfirm}
          >
            Start splitting &rarr;
          </Button>

        </div>
      </div>
    </div>
  )
}
