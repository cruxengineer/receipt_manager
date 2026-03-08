import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SummaryScreen } from './SummaryScreen'
import type { SwipeAssignments } from '@/types/swipe'

// Helper to build an ItemAssignment
const assignment = (
  name: string,
  price: number,
  assignee: 'A' | 'B' | 'split'
) => ({ item: { name, price }, assignee })

const defaultAssignments: SwipeAssignments = [
  assignment('Burger', 10, 'A'),
  assignment('Salad', 8, 'B'),
  assignment('Fries', 6, 'split'),
]

const defaultProps = {
  assignments: defaultAssignments,
  personAName: 'Alice',
  personBName: 'Bob',
  onAdjust: vi.fn(),
  onStartOver: vi.fn(),
  onEditNames: vi.fn(),
}

describe('SummaryScreen', () => {
  describe('totals bar', () => {
    it('renders personAName and personBName in the totals bar', () => {
      render(<SummaryScreen {...defaultProps} />)
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    it('shows correct totalA ($13.00) in the totals bar', () => {
      render(<SummaryScreen {...defaultProps} />)
      // A gets Burger $10 + half of Fries $3 = $13.00
      expect(screen.getByText('$13.00')).toBeInTheDocument()
    })

    it('shows correct totalB ($11.00) in the totals bar', () => {
      render(<SummaryScreen {...defaultProps} />)
      // B gets Salad $8 + half of Fries $3 = $11.00
      expect(screen.getByText('$11.00')).toBeInTheDocument()
    })

    it('applies --color-person-a and --color-person-b color tokens', () => {
      const { container } = render(<SummaryScreen {...defaultProps} />)
      const personAEl = container.querySelector('[style*="--color-person-a"]')
      const personBEl = container.querySelector('[style*="--color-person-b"]')
      expect(personAEl).not.toBeNull()
      expect(personBEl).not.toBeNull()
    })

    it('clicking pencil/edit icon calls onEditNames', () => {
      const onEditNames = vi.fn()
      render(<SummaryScreen {...defaultProps} onEditNames={onEditNames} />)
      const editButtons = screen.getAllByRole('button', { name: /edit names/i })
      expect(editButtons.length).toBeGreaterThanOrEqual(1)
      fireEvent.click(editButtons[0])
      expect(onEditNames).toHaveBeenCalledTimes(1)
    })
  })

  describe('item lists', () => {
    it("shows A-assigned item (Burger) under Person A's section", () => {
      render(<SummaryScreen {...defaultProps} />)
      expect(screen.getByText('Burger')).toBeInTheDocument()
    })

    it("shows B-assigned item (Salad) under Person B's section", () => {
      render(<SummaryScreen {...defaultProps} />)
      expect(screen.getByText('Salad')).toBeInTheDocument()
    })

    it('shows Burger at full price $10.00', () => {
      render(<SummaryScreen {...defaultProps} />)
      expect(screen.getByText('$10.00')).toBeInTheDocument()
    })

    it('shows Salad at full price $8.00', () => {
      render(<SummaryScreen {...defaultProps} />)
      expect(screen.getByText('$8.00')).toBeInTheDocument()
    })

    it('split item (Fries) appears in both lists', () => {
      render(<SummaryScreen {...defaultProps} />)
      const fries = screen.getAllByText('Fries')
      expect(fries).toHaveLength(2)
    })

    it('split item shows at half price ($3.00) in each list', () => {
      render(<SummaryScreen {...defaultProps} />)
      // Fries $6 split → $3.00 each; appears in both lists
      const halfPrices = screen.getAllByText('$3.00')
      expect(halfPrices).toHaveLength(2)
    })

    it('split items show "Split ½" badge in both lists', () => {
      render(<SummaryScreen {...defaultProps} />)
      const splitBadges = screen.getAllByText('Split ½')
      expect(splitBadges).toHaveLength(2)
    })
  })

  describe('math correctness', () => {
    it('A=$10, B=$8, split=$6 → totalA=$13.00 and totalB=$11.00', () => {
      render(<SummaryScreen {...defaultProps} />)
      expect(screen.getByText('$13.00')).toBeInTheDocument()
      expect(screen.getByText('$11.00')).toBeInTheDocument()
    })

    it('empty assignments: both totals show $0.00', () => {
      render(
        <SummaryScreen
          {...defaultProps}
          assignments={[]}
        />
      )
      const zeros = screen.getAllByText('$0.00')
      expect(zeros).toHaveLength(2)
    })
  })

  describe('action buttons', () => {
    it('clicking "Adjust" calls onAdjust', () => {
      const onAdjust = vi.fn()
      render(<SummaryScreen {...defaultProps} onAdjust={onAdjust} />)
      fireEvent.click(screen.getByRole('button', { name: /adjust/i }))
      expect(onAdjust).toHaveBeenCalledTimes(1)
    })

    it('clicking "Start Over" calls onStartOver', () => {
      const onStartOver = vi.fn()
      render(<SummaryScreen {...defaultProps} onStartOver={onStartOver} />)
      fireEvent.click(screen.getByRole('button', { name: /start over/i }))
      expect(onStartOver).toHaveBeenCalledTimes(1)
    })
  })
})
