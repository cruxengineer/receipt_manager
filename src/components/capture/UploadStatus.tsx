import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadStatusProps {
  isProcessing?: boolean
  error?: string | null
  onRetry?: () => void
}

/**
 * Displays loading state (CAPT-04) or error state (CAPT-05).
 * Returns null when neither isProcessing nor error is set.
 *
 * Accessibility:
 *   - Spinner: role="status" + aria-live="polite" announces to screen readers
 *   - Error: role="alert" announces immediately (aria-live="assertive" implicit)
 */
export function UploadStatus({ isProcessing, error, onRetry }: UploadStatusProps) {
  if (isProcessing) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Processing receipt"
        className="flex flex-col items-center gap-3 py-6"
      >
        <svg
          className="animate-spin size-8 text-slate-600"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
          />
        </svg>
        <p className="text-sm text-slate-600">Reading your receipt…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-md bg-red-50 border border-red-200 p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className="size-5 text-red-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onRetry}
              >
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
