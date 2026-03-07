import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NamesModalProps {
  defaultNameA: string
  defaultNameB: string
  onConfirm: (nameA: string, nameB: string) => void
}

export function NamesModal({ defaultNameA, defaultNameB, onConfirm }: NamesModalProps) {
  const [nameA, setNameA] = useState(defaultNameA)
  const [nameB, setNameB] = useState(defaultNameB)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(nameA.trim() || defaultNameA, nameB.trim() || defaultNameB)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ReceiptSplit</h1>
          <p className="text-gray-500 mt-1 text-sm">Who's splitting this?</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Person A block */}
            <div className="space-y-2" style={{ color: 'var(--color-person-a)' }}>
              <label className="text-sm font-medium">Person 1</label>
              <input
                autoFocus
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                placeholder="Enter name…"
                className={cn('w-full px-3 py-2 border rounded-md text-sm', 'focus:outline-none')}
                style={{ borderColor: 'var(--color-person-a)' }}
              />
            </div>

            {/* Person B block */}
            <div className="space-y-2" style={{ color: 'var(--color-person-b)' }}>
              <label className="text-sm font-medium">Person 2</label>
              <input
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                placeholder="Enter name…"
                className={cn('w-full px-3 py-2 border rounded-md text-sm', 'focus:outline-none')}
                style={{ borderColor: 'var(--color-person-b)' }}
              />
            </div>

            <Button type="submit" className="w-full">Let's go →</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
