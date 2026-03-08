import { useReceiptFiles } from '@/hooks/useReceiptFiles'
import { FileInputTrigger } from './FileInputTrigger'
import { ImagePreviewList } from './ImagePreviewList'
import { UploadStatus } from './UploadStatus'
import { Button } from '@/components/ui/button'

interface CaptureScreenProps {
  /**
   * Controlled processing state — caller sets this to true while AI processes.
   * When true, the add-photos button is hidden and a spinner is shown.
   */
  isProcessing?: boolean
  /**
   * Error message to display — caller sets this when processing fails.
   * Shows error alert with retry button.
   */
  error?: string | null
  /**
   * Called when the user clicks "Try again" in the error state.
   * Caller should clear the error and allow re-submission.
   */
  onRetry?: () => void
  /**
   * Called when the user opts to add items manually after repeated failures.
   * When provided (after 2+ failures), shown alongside the retry button.
   */
  onAddManually?: () => void
  /**
   * Called when the user taps "Process Receipts".
   * Receives the selected File objects for the caller to submit to AI.
   * Phase 3 will wire this to the AI processing hook.
   */
  onSubmit?: (files: File[]) => void
}

/**
 * The entry point of ReceiptSplit — the first screen users see.
 * App opens directly to this screen (no welcome/landing page per CONTEXT.md).
 *
 * State ownership:
 * - File list state (files, addFiles, removeFile, clearFiles) — owned by useReceiptFiles hook
 * - isProcessing, error — lifted to caller (App.tsx) so Phase 3 can control them
 *
 * Layout: h-dvh locked layout with safe area padding for iPhone 16 Dynamic Island support
 */
export default function CaptureScreen({
  isProcessing = false,
  error = null,
  onRetry,
  onAddManually,
  onSubmit,
}: CaptureScreenProps) {
  const { files, addFiles, removeFile, clearFiles } = useReceiptFiles()

  const handleSubmit = () => {
    if (files.length === 0) return
    onSubmit?.(files.map((f) => f.file))
  }

  const handleRetry = () => {
    clearFiles()
    onRetry?.()
  }

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* Header — flex-shrink-0 with safe area top padding */}
        <header className="text-center py-6 px-4 flex-shrink-0 pt-safe-4">
          <h1 className="text-3xl font-bold text-gray-900">ReceiptSplit</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Upload a receipt photo to get started
          </p>
        </header>

        {/* Scrollable main area */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {/* Main card */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <UploadStatus
              isProcessing={isProcessing}
              error={error}
              onRetry={handleRetry}
            />
            {!isProcessing && !error && files.length === 0 && (
              <FileInputTrigger
                onFilesSelected={addFiles}
                disabled={isProcessing}
              />
            )}
            {files.length > 0 && !isProcessing && (
              <ImagePreviewList files={files} onRemove={removeFile} />
            )}
            {files.length > 0 && !isProcessing && !error && (
              <Button
                onClick={handleSubmit}
                className="w-full"
                variant="default"
              >
                Process {files.length === 1 ? 'Receipt' : `${files.length} Receipts`}
              </Button>
            )}
          </div>

          {/* Always-available manual entry fallback */}
          {onAddManually && !isProcessing && (
            <p className="text-center text-sm text-gray-400">
              or{' '}
              <button
                type="button"
                onClick={onAddManually}
                className="underline underline-offset-2 hover:text-gray-600"
              >
                add items manually
              </button>
            </p>
          )}
        </div>

        {/* Bottom safe area spacer */}
        <div className="flex-shrink-0 pb-safe" />

      </div>
    </div>
  )
}
