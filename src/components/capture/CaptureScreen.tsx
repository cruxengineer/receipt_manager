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
 * Layout: max-w-md centered card (established pattern from Phase 1 App.tsx)
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <header className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900">ReceiptSplit</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Upload a receipt photo to get started
          </p>
        </header>

        {/* Main card */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">

          {/* Status: spinner or error — replaces add button when active */}
          <UploadStatus
            isProcessing={isProcessing}
            error={error}
            onRetry={handleRetry}
          />

          {/* Add photo button — hidden once a file is selected, while processing, or on error */}
          {!isProcessing && !error && files.length === 0 && (
            <FileInputTrigger
              onFilesSelected={addFiles}
              disabled={isProcessing}
            />
          )}

          {/* Image previews */}
          {files.length > 0 && !isProcessing && (
            <ImagePreviewList files={files} onRemove={removeFile} />
          )}

          {/* Process button — only shown when files are ready and idle */}
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
    </div>
  )
}
