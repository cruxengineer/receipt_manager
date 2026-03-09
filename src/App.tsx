import { useState } from 'react'
import CaptureScreen from '@/components/capture/CaptureScreen'
import { PasswordGate } from '@/components/gate/PasswordGate'
import { ReviewScreen } from '@/components/review/ReviewScreen'
import { NamesModal } from '@/components/names/NamesModal'
import { SwipeScreen } from '@/components/swipe/SwipeScreen'
import { SummaryScreen } from '@/components/summary/SummaryScreen'
import { parseReceipt } from '@/ai/parseReceipt'
import type { ReceiptItem, SkippedRegion } from '@/types/ai'
import type { SwipeAssignments } from '@/types/swipe'

type AppState = 'gate' | 'names' | 'capture' | 'processing' | 'review' | 'swipe' | 'summary'

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
  // Confirmed items from ReviewScreen, passed into SwipeScreen
  const [confirmedItems, setConfirmedItems] = useState<ReceiptItem[]>([])
  const [personAName, setPersonAName] = useState('Tom')
  const [personBName, setPersonBName] = useState('Jerry')
  const [assignments, setAssignments] = useState<SwipeAssignments>([])
  const [swipeKey, setSwipeKey] = useState(0)
  const [returnAfterNames, setReturnAfterNames] = useState<AppState>('capture')
  const [isAddingAnother, setIsAddingAnother] = useState(false)
  const [receiptGroupSizes, setReceiptGroupSizes] = useState<number[]>([])

  const handleUnlock = () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    setAppState('names')
  }

  const handleNamesConfirm = (nameA: string, nameB: string) => {
    setPersonAName(nameA.trim() || 'Tom')
    setPersonBName(nameB.trim() || 'Jerry')
    setAppState(returnAfterNames)
    setReturnAfterNames('capture')   // reset to default for next time
  }

  const handleAdjust = () => {
    setAssignments([])
    setSwipeKey(k => k + 1)   // remounts SwipeScreen, resets its internal currentIndex
    setAppState('swipe')
  }

  const handleStartOver = () => {
    setAssignments([])
    setConfirmedItems([])
    setReviewItems([])
    setReceiptGroupSizes([])
    setSkippedRegions([])
    setSourceFiles([])
    setSwipeKey(k => k + 1)
    setAppState('capture')
  }

  const handleEditNamesFromSummary = () => {
    setReturnAfterNames('summary')
    setAppState('names')
  }

  const handleSubmit = async (files: File[]) => {
    setError(null)
    setSourceFiles(files)
    setAppState('processing')
    try {
      const result = await parseReceipt(files)
      if (isAddingAnother) {
        setReviewItems(prev => [...prev, ...result.items])
        setReceiptGroupSizes(prev => [...prev, result.items.length])
        setIsAddingAnother(false)
      } else {
        setReviewItems(result.items)
        setReceiptGroupSizes([result.items.length])
      }
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
    setIsAddingAnother(false)
    setAppState('capture')
  }

  const handleAddAnotherReceipt = () => {
    setIsAddingAnother(true)
    setSkippedRegions([])
    setSourceFiles([])
    setAppState('capture')
  }

  const handleAddManually = () => {
    setError(null)
    setAiAttempted(false)
    setReviewItems([])
    setReceiptGroupSizes([])
    setSkippedRegions([])
    setAppState('review')
  }

  const handleBack = () => {
    setAppState('capture')
  }

  const handleConfirm = (items: ReceiptItem[]) => {
    setConfirmedItems(items)
    setAppState('swipe')
  }

  const handleSwipeComplete = (result: SwipeAssignments) => {
    setAssignments(result)
    setAppState('summary')
  }

  if (appState === 'gate') {
    return <PasswordGate onUnlock={handleUnlock} />
  }
  if (appState === 'names') {
    return (
      <NamesModal
        defaultNameA={personAName}
        defaultNameB={personBName}
        onConfirm={handleNamesConfirm}
      />
    )
  }
  if (appState === 'review') {
    return (
      <ReviewScreen
        items={reviewItems}
        skippedRegions={skippedRegions}
        sourceFiles={sourceFiles}
        aiAttempted={aiAttempted}
        receiptGroupSizes={receiptGroupSizes}
        onConfirm={handleConfirm}
        onBack={handleBack}
        onAddAnother={handleAddAnotherReceipt}
      />
    )
  }
  if (appState === 'swipe') {
    return (
      <SwipeScreen
        key={swipeKey}
        items={confirmedItems}
        personAName={personAName}
        personBName={personBName}
        onComplete={handleSwipeComplete}
      />
    )
  }
  if (appState === 'summary') {
    return (
      <SummaryScreen
        assignments={assignments}
        personAName={personAName}
        personBName={personBName}
        onAdjust={handleAdjust}
        onStartOver={handleStartOver}
        onEditNames={handleEditNamesFromSummary}
      />
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
