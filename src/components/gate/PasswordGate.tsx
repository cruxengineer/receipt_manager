import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PasswordGateProps {
  /** Called when user enters the correct passphrase. App.tsx advances state to 'capture'. */
  onUnlock: () => void
}

export function PasswordGate({ onUnlock }: PasswordGateProps): JSX.Element {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed === import.meta.env.VITE_APP_PASSWORD) {
      setError(null)
      onUnlock()
    } else {
      setError('Incorrect passphrase.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ReceiptSplit</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter passphrase to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="passphrase" className="text-sm font-medium text-gray-700">
                Passphrase
              </label>
              <input
                id="passphrase"
                type="password"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter passphrase"
                className={cn(
                  'w-full px-3 py-2 border rounded-md text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  error
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-slate-900'
                )}
              />
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
