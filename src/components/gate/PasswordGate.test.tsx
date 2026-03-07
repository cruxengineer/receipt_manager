import { render, screen, fireEvent } from '@testing-library/react'
import { PasswordGate } from './PasswordGate'

// Mock import.meta.env.VITE_APP_PASSWORD
vi.stubEnv('VITE_APP_PASSWORD', 'test-secret')

describe('PasswordGate', () => {
  it('Test 1 (renders): renders a password input and a submit button', () => {
    const onUnlock = vi.fn()
    render(<PasswordGate onUnlock={onUnlock} />)

    // password inputs are not role="textbox" — query by type directly
    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /unlock/i })).toBeInTheDocument()
  })

  it('Test 2 (correct password): calling submit with correct passphrase calls onUnlock once', () => {
    const onUnlock = vi.fn()
    render(<PasswordGate onUnlock={onUnlock} />)

    const input = document.querySelector('input[type="password"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test-secret' } })
    fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

    expect(onUnlock).toHaveBeenCalledTimes(1)
  })

  it('Test 3 (wrong password): incorrect passphrase does NOT call onUnlock and shows error', () => {
    const onUnlock = vi.fn()
    render(<PasswordGate onUnlock={onUnlock} />)

    const input = document.querySelector('input[type="password"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

    expect(onUnlock).not.toHaveBeenCalled()
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument()
  })

  it('Test 4 (Enter key): pressing Enter with correct passphrase calls onUnlock', () => {
    const onUnlock = vi.fn()
    render(<PasswordGate onUnlock={onUnlock} />)

    const input = document.querySelector('input[type="password"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test-secret' } })
    fireEvent.submit(input.closest('form')!)

    expect(onUnlock).toHaveBeenCalledTimes(1)
  })

  it('Test 5 (empty submit): clicking submit with empty input does NOT call onUnlock and shows error', () => {
    const onUnlock = vi.fn()
    render(<PasswordGate onUnlock={onUnlock} />)

    fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

    expect(onUnlock).not.toHaveBeenCalled()
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument()
  })

  it('Test 6 (input type): the input element has type="password"', () => {
    const onUnlock = vi.fn()
    render(<PasswordGate onUnlock={onUnlock} />)

    const input = document.querySelector('input[type="password"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.type).toBe('password')
  })
})
