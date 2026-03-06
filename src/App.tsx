import { useState } from 'react'
import CaptureScreen from '@/components/capture/CaptureScreen'

/**
 * App root — Phase 2.
 *
 * State lifted here so Phase 3 (AI integration) can replace the stub handlers
 * with real API calls without touching CaptureScreen.
 *
 * Phase 3 will replace handleSubmit with the actual AI vision call.
 * For now it simulates a brief processing state and then clears it.
 */
function App() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (files: File[]) => {
    setError(null)
    setIsProcessing(true)

    // Phase 3 stub: simulate processing delay, then clear
    // Replace this block with AI vision call in Phase 3
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsProcessing(false)

    // Uncomment to test error state during development:
    // setError('Could not read receipt. Please try a clearer photo.')
    console.log('Receipt files ready for Phase 3 AI processing:', files)
  }

  const handleRetry = () => {
    setError(null)
  }

  return (
    <CaptureScreen
      isProcessing={isProcessing}
      error={error}
      onRetry={handleRetry}
      onSubmit={handleSubmit}
    />
  )
}

export default App
