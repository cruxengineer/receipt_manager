import { useState } from 'react'
import CaptureScreen from '@/components/capture/CaptureScreen'
import { PasswordGate } from '@/components/gate/PasswordGate'
import { ReviewScreen } from '@/components/review/ReviewScreen'
import { parseReceipt } from '@/ai/parseReceipt'
import type { ReceiptItem, SkippedRegion } from '@/types/ai'

type AppState = 'gate' | 'capture' | 'processing' | 'review' | 'swipe'

const SESSION_KEY = 'receipt-split-unlocked'

function App() {
  // Start at 'gate' — check sessionStorage synchronously on mount
  const [appState, setAppState] = useState<AppState>(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true' ? 'capture' : 'gate'
  })
  const [error, setError] = useState<string | null>(null)
  const [aiAttempted, setAiAttempted] = useState(false)
  const [reviewItems, setReviewItems] = useState<ReceiptItem[]>([])
  const [skippedRegions, setSkippedRegions] = useState<SkippedRegion[]>([])
  // sourceFiles held in state so ReviewScreen can render canvas crops for skipped regions
  const [sourceFiles, setSourceFiles] = useState<File[]>([])
  // Phase 5 placeholder: final confirmed items from ReviewScreen
  const [confirmedItems, setConfirmedItems] = useState<ReceiptItem[]>([])

  const handleUnlock = () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    setAppState('capture')
  }

  const handleSubmit = async (files: File[]) => {
    setError(null)
    setSourceFiles(files)   // Retain files for ReviewScreen crop rendering
    setAppState('processing')
    try {
      const result = await parseReceipt(files)
      setReviewItems(result.items)
      setSkippedRegions(result.skippedRegions)
      setAiAttempted(true)
      setAppState('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setAppState('capture')
    }
  }

  const handleRetry = () => {
    setError(null)
    setAppState('capture')
  }

  const handleAddManually = () => {
    setError(null)
    setAiAttempted(false)
    setReviewItems([])
    setSkippedRegions([])
    setAppState('review')
  }

  const handleBack = () => {
    setAppState('capture')
  }

  const handleConfirm = (items: ReceiptItem[]) => {
    setConfirmedItems(items)
    setAppState('swipe')
    // Phase 5 will render SwipeScreen here
    console.log('Phase 5 placeholder — confirmed items ready:', items)
  }

  if (appState === 'gate') {
    return <PasswordGate onUnlock={handleUnlock} />
  }

  if (appState === 'review') {
    return (
      <ReviewScreen
        items={reviewItems}
        skippedRegions={skippedRegions}
        sourceFiles={sourceFiles}
        aiAttempted={aiAttempted}
        onConfirm={handleConfirm}
        onBack={handleBack}
      />
    )
  }

  if (appState === 'swipe') {
    // Phase 5 placeholder — SwipeScreen not yet implemented
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <p className="text-gray-500">Phase 5: Swipe flow coming soon</p>
          <p className="text-xs text-gray-400 mt-2">{confirmedItems.length} items ready</p>
        </div>
      </div>
    )
  }

  // appState === 'capture' | 'processing'
  return (
    <CaptureScreen
      isProcessing={appState === 'processing'}
      error={error}
      onRetry={handleRetry}
      onAddManually={handleAddManually}
      onSubmit={handleSubmit}
    />
  )
}

export default App
