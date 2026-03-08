import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import CaptureScreen from './CaptureScreen'

describe('CaptureScreen', () => {
  it('renders a file input with accept="image/*" (CAPT-01, CAPT-02)', () => {
    render(<CaptureScreen />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.accept).toBe('image/*')
    expect(input.multiple).toBe(false)
  })

  it('does NOT use capture attribute (iOS action sheet requirement)', () => {
    render(<CaptureScreen />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.capture).toBeFalsy()
  })

  it('shows "Add Receipt Photo" button in idle state', () => {
    render(<CaptureScreen />)
    expect(screen.getByRole('button', { name: /add receipt photo/i })).toBeInTheDocument()
  })

  it('renders spinner with role="status" when isProcessing is true (CAPT-04)', () => {
    render(<CaptureScreen isProcessing={true} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add receipt photo/i })).not.toBeInTheDocument()
  })

  it('renders error message and retry button when error is set (CAPT-05)', () => {
    render(<CaptureScreen error="Could not read receipt. Please try a clearer photo." />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/could not read receipt/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('retry button calls onRetry callback (CAPT-05)', async () => {
    const onRetry = vi.fn()
    render(<CaptureScreen error="Error" onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
