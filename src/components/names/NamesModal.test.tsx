import { render, screen, fireEvent } from '@testing-library/react'
import { NamesModal } from './NamesModal'

describe('NamesModal', () => {
  it('Test 1 (renders): renders two text inputs and a submit button with text matching /let.?s go/i', () => {
    const onConfirm = vi.fn()
    render(<NamesModal defaultNameA="Tom" defaultNameB="Jerry" onConfirm={onConfirm} />)

    const inputs = document.querySelectorAll('input[type="text"]')
    expect(inputs).toHaveLength(2)
    expect(screen.getByRole('button', { name: /let.?s go/i })).toBeInTheDocument()
  })

  it('Test 2 (defaults): both inputs are pre-filled with defaultNameA and defaultNameB props', () => {
    const onConfirm = vi.fn()
    render(<NamesModal defaultNameA="Tom" defaultNameB="Jerry" onConfirm={onConfirm} />)

    expect(screen.getByDisplayValue('Tom')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Jerry')).toBeInTheDocument()
  })

  it('Test 3 (custom names): typing into both inputs and submitting calls onConfirm with the typed values', () => {
    const onConfirm = vi.fn()
    render(<NamesModal defaultNameA="Tom" defaultNameB="Jerry" onConfirm={onConfirm} />)

    const inputA = screen.getByDisplayValue('Tom')
    const inputB = screen.getByDisplayValue('Jerry')
    fireEvent.change(inputA, { target: { value: 'Alice' } })
    fireEvent.change(inputB, { target: { value: 'Bob' } })
    fireEvent.submit(inputA.closest('form')!)

    expect(onConfirm).toHaveBeenCalledWith('Alice', 'Bob')
  })

  it('Test 4 (submit defaults): submitting without typing calls onConfirm with default names', () => {
    const onConfirm = vi.fn()
    render(<NamesModal defaultNameA="Tom" defaultNameB="Jerry" onConfirm={onConfirm} />)

    fireEvent.click(screen.getByRole('button', { name: /let.?s go/i }))

    expect(onConfirm).toHaveBeenCalledWith('Tom', 'Jerry')
  })

  it('Test 5 (empty fallback): clearing nameA input and submitting calls onConfirm with defaultNameA, not empty string', () => {
    const onConfirm = vi.fn()
    render(<NamesModal defaultNameA="Tom" defaultNameB="Jerry" onConfirm={onConfirm} />)

    const inputA = screen.getByDisplayValue('Tom')
    fireEvent.change(inputA, { target: { value: '' } })
    fireEvent.submit(inputA.closest('form')!)

    expect(onConfirm).toHaveBeenCalledWith('Tom', 'Jerry')
  })

  it('Test 6 (color): Person A container has var(--color-person-a) style; Person B has var(--color-person-b)', () => {
    const onConfirm = vi.fn()
    render(<NamesModal defaultNameA="Tom" defaultNameB="Jerry" onConfirm={onConfirm} />)

    expect(document.querySelector('[style*="--color-person-a"]')).toBeInTheDocument()
    expect(document.querySelector('[style*="--color-person-b"]')).toBeInTheDocument()
  })
})
