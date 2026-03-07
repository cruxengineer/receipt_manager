import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SwipeScreen } from './SwipeScreen'
import type { ReceiptItem } from '@/types/ai'

const item = (name: string, price: number): ReceiptItem => ({ name, price })

const defaultProps = {
  items: [item('Burger', 12.5)],
  personAName: 'Tom',
  personBName: 'Jerry',
  onComplete: vi.fn(),
}

describe('SwipeScreen', () => {
  describe('card rendering', () => {
    it('renders the current item name and price', () => {
      render(<SwipeScreen {...defaultProps} />)
      expect(screen.getByText('Burger')).toBeInTheDocument()
      expect(screen.getByText('$12.50')).toBeInTheDocument()
    })
  })

  describe('progress indicator', () => {
    it('shows "Item 1 of 3" initially with 3 items', () => {
      render(
        <SwipeScreen
          items={[item('Burger', 12.5), item('Fries', 4.0), item('Coke', 2.5)]}
          personAName="Tom"
          personBName="Jerry"
          onComplete={vi.fn()}
        />
      )
      expect(screen.getByText('Item 1 of 3')).toBeInTheDocument()
    })

    it('shows "Item 2 of 3" after assigning first item', () => {
      render(
        <SwipeScreen
          items={[item('Burger', 12.5), item('Fries', 4.0), item('Coke', 2.5)]}
          personAName="Tom"
          personBName="Jerry"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /split/i }))
      expect(screen.getByText('Item 2 of 3')).toBeInTheDocument()
    })
  })

  describe('running totals bar', () => {
    it('renders personAName and personBName with $0.00 initially', () => {
      render(<SwipeScreen {...defaultProps} />)
      expect(screen.getByText('Tom')).toBeInTheDocument()
      expect(screen.getByText('Jerry')).toBeInTheDocument()
      const zeros = screen.getAllByText('$0.00')
      expect(zeros).toHaveLength(2)
    })
  })

  describe('split math', () => {
    it('clicking split on $18.50 item adds $9.25 to both Tom and Jerry', () => {
      render(
        <SwipeScreen
          items={[item('Steak', 18.5), item('Dessert', 10.0)]}
          personAName="Tom"
          personBName="Jerry"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /split/i }))
      const ninetwentyfive = screen.getAllByText('$9.25')
      expect(ninetwentyfive).toHaveLength(2)
    })
  })

  describe('back button', () => {
    it('back button is present and disabled on the first card (no assignments)', () => {
      render(<SwipeScreen {...defaultProps} />)
      const backButton = screen.getByRole('button', { name: /back/i })
      expect(backButton).toBeInTheDocument()
      expect(backButton).toBeDisabled()
    })

    it('back button becomes enabled after assigning one item', () => {
      render(
        <SwipeScreen
          items={[item('Burger', 12.5), item('Fries', 4.0)]}
          personAName="Tom"
          personBName="Jerry"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /split/i }))
      const backButton = screen.getByRole('button', { name: /back/i })
      expect(backButton).not.toBeDisabled()
    })

    it('clicking back after assigning item 1 shows item 1 again and resets totals to $0.00', () => {
      render(
        <SwipeScreen
          items={[item('Burger', 12.5), item('Fries', 4.0)]}
          personAName="Tom"
          personBName="Jerry"
          onComplete={vi.fn()}
        />
      )
      // Assign first item via split
      fireEvent.click(screen.getByRole('button', { name: /split/i }))
      // Now on item 2 — go back
      const backButton = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backButton)
      // Item 1 should be visible again
      expect(screen.getByText('Burger')).toBeInTheDocument()
      // Totals should be reset to $0.00
      const zeros = screen.getAllByText('$0.00')
      expect(zeros).toHaveLength(2)
    })
  })

  describe('completion', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('onComplete fires after 1500ms with ItemAssignment[] of length 1', () => {
      const onComplete = vi.fn()
      render(
        <SwipeScreen
          items={[item('Burger', 12.5)]}
          personAName="Tom"
          personBName="Jerry"
          onComplete={onComplete}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /split/i }))
      // allDone=true renders synchronously; onComplete not yet called
      expect(onComplete).not.toHaveBeenCalled()
      act(() => {
        vi.advanceTimersByTime(1500)
      })
      expect(onComplete).toHaveBeenCalledWith([
        { item: { name: 'Burger', price: 12.5 }, assignee: 'split' },
      ])
    })

    it('all done state visible immediately, then onComplete fires after 1500ms', () => {
      const onComplete = vi.fn()
      render(
        <SwipeScreen
          items={[item('Burger', 12.5)]}
          personAName="Tom"
          personBName="Jerry"
          onComplete={onComplete}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /split/i }))
      // Immediately: "All done!" is in the DOM
      expect(screen.getByText(/all done/i)).toBeInTheDocument()
      // onComplete has NOT fired yet (timer pending)
      expect(onComplete).not.toHaveBeenCalled()
      // After 1500ms: onComplete fires
      act(() => {
        vi.advanceTimersByTime(1500)
      })
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('hint text', () => {
    it('shows hint text matching /← Tom · Split · Jerry →/ on first item', () => {
      render(<SwipeScreen {...defaultProps} />)
      expect(screen.getByText(/← Tom · Split · Jerry →/)).toBeInTheDocument()
    })

    it('hint text is absent after first item is assigned', () => {
      render(
        <SwipeScreen
          items={[item('Burger', 12.5), item('Fries', 4.0)]}
          personAName="Tom"
          personBName="Jerry"
          onComplete={vi.fn()}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /split/i }))
      expect(screen.queryByText(/← Tom · Split · Jerry →/)).not.toBeInTheDocument()
    })
  })

  describe('color coding', () => {
    it("Tom total has style containing '--color-person-a' and Jerry total has '--color-person-b'", () => {
      const { container } = render(<SwipeScreen {...defaultProps} />)
      const personAEl = container.querySelector('[style*="--color-person-a"]')
      const personBEl = container.querySelector('[style*="--color-person-b"]')
      expect(personAEl).not.toBeNull()
      expect(personBEl).not.toBeNull()
    })
  })
})
