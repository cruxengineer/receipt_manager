import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ReviewScreen } from './ReviewScreen'
import type { ReceiptItem, SkippedRegion } from '@/types/ai'

// Mock SkippedRegionCrop to avoid canvas in tests
vi.mock('@/components/review/SkippedRegionCrop', () => ({
  SkippedRegionCrop: ({ file, boundingBox }: { file: File; boundingBox: object }) => (
    <div
      data-testid="skipped-crop"
      data-file-name={(file as File).name}
      data-bbox={JSON.stringify(boundingBox)}
    />
  ),
}))

const makeItems = (): ReceiptItem[] => [
  { name: 'Burger', price: 14.0 },
  { name: 'Fries', price: 3.5 },
]

const makeSkippedRegion = (imageIndex = 0): SkippedRegion => ({
  imageIndex,
  boundingBox: { x: 0.1, y: 0.2, width: 0.5, height: 0.3 },
})

const makeFakeFile = (name = 'receipt.jpg') =>
  new File(['fake'], name, { type: 'image/jpeg' })

describe('ReviewScreen', () => {
  it('Test 1: renders all items with name and formatted price', () => {
    const items = makeItems()
    render(
      <ReviewScreen
        items={items}
        skippedRegions={[]}
        sourceFiles={[]}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText('$14.00')).toBeInTheDocument()
    expect(screen.getByText('Fries')).toBeInTheDocument()
    expect(screen.getByText('$3.50')).toBeInTheDocument()
  })

  it('Test 2: clicking remove button removes the item from the list', () => {
    const items = makeItems()
    render(
      <ReviewScreen
        items={items}
        skippedRegions={[]}
        sourceFiles={[]}
        onConfirm={vi.fn()}
      />
    )

    // Remove Burger
    const removeButtons = screen.getAllByRole('button', { name: /remove|×/i })
    // The first remove button corresponds to Burger
    fireEvent.click(removeButtons[0])

    expect(screen.queryByText('Burger')).not.toBeInTheDocument()
    expect(screen.getByText('Fries')).toBeInTheDocument()
  })

  it('Test 3: filling name and price inputs and clicking Add item adds the item', () => {
    render(
      <ReviewScreen
        items={[]}
        skippedRegions={[]}
        sourceFiles={[]}
        onConfirm={vi.fn()}
      />
    )

    const nameInput = screen.getByPlaceholderText(/item name/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    const addButton = screen.getByRole('button', { name: /add item/i })

    fireEvent.change(nameInput, { target: { value: 'Salad' } })
    fireEvent.change(priceInput, { target: { value: '9.50' } })
    fireEvent.click(addButton)

    expect(screen.getByText('Salad')).toBeInTheDocument()
    expect(screen.getByText('$9.50')).toBeInTheDocument()
  })

  it('Test 4: clicking Add item with empty name does not add an item', () => {
    render(
      <ReviewScreen
        items={[{ name: 'Existing', price: 5.0 }]}
        skippedRegions={[]}
        sourceFiles={[]}
        onConfirm={vi.fn()}
      />
    )

    const priceInput = screen.getByPlaceholderText(/price/i)
    const addButton = screen.getByRole('button', { name: /add item/i })

    // Only fill price, leave name empty
    fireEvent.change(priceInput, { target: { value: '9.50' } })
    fireEvent.click(addButton)

    // Still only one item (Existing)
    expect(screen.queryAllByRole('button', { name: /remove|×/i })).toHaveLength(1)
  })

  it('Test 4b: clicking Add item with non-numeric price does not add an item', () => {
    render(
      <ReviewScreen
        items={[{ name: 'Existing', price: 5.0 }]}
        skippedRegions={[]}
        sourceFiles={[]}
        onConfirm={vi.fn()}
      />
    )

    const nameInput = screen.getByPlaceholderText(/item name/i)
    const priceInput = screen.getByPlaceholderText(/price/i)
    const addButton = screen.getByRole('button', { name: /add item/i })

    fireEvent.change(nameInput, { target: { value: 'Bad Item' } })
    fireEvent.change(priceInput, { target: { value: 'abc' } })
    fireEvent.click(addButton)

    // Still only one item
    expect(screen.queryByText('Bad Item')).not.toBeInTheDocument()
  })

  it('Test 5: clicking Start splitting calls onConfirm with current items', () => {
    const onConfirm = vi.fn()
    const items = makeItems()
    render(
      <ReviewScreen
        items={items}
        skippedRegions={[]}
        sourceFiles={[]}
        onConfirm={onConfirm}
      />
    )

    // Remove one item first
    const removeButtons = screen.getAllByRole('button', { name: /remove|×/i })
    fireEvent.click(removeButtons[0])

    const startButton = screen.getByRole('button', { name: /start splitting/i })
    fireEvent.click(startButton)

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledWith([{ name: 'Fries', price: 3.5 }])
  })

  it('Test 6: renders SkippedRegionCrop with correct file and boundingBox when skippedRegions present', () => {
    const region = makeSkippedRegion(0)
    const file = makeFakeFile('receipt.jpg')
    render(
      <ReviewScreen
        items={makeItems()}
        skippedRegions={[region]}
        sourceFiles={[file]}
        onConfirm={vi.fn()}
      />
    )

    const crop = screen.getByTestId('skipped-crop')
    expect(crop).toBeInTheDocument()
    expect(crop.getAttribute('data-file-name')).toBe('receipt.jpg')
    expect(JSON.parse(crop.getAttribute('data-bbox')!)).toEqual(region.boundingBox)
  })

  it('Test 7: no skipped section rendered when skippedRegions is empty', () => {
    render(
      <ReviewScreen
        items={makeItems()}
        skippedRegions={[]}
        sourceFiles={[]}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.queryByTestId('skipped-crop')).not.toBeInTheDocument()
    expect(screen.queryByText(/couldn't be read/i)).not.toBeInTheDocument()
  })

  it('Test 8: item prices are displayed as currency formatted strings', () => {
    render(
      <ReviewScreen
        items={[{ name: 'Drink', price: 9.5 }]}
        skippedRegions={[]}
        sourceFiles={[]}
        onConfirm={vi.fn()}
      />
    )

    // Price 9.5 should show as "$9.50" not "9.5"
    expect(screen.getByText('$9.50')).toBeInTheDocument()
    expect(screen.queryByText('9.5')).not.toBeInTheDocument()
  })

  it('Test 9: skipped count heading shown when skippedRegions.length > 0', () => {
    const regions = [makeSkippedRegion(0), makeSkippedRegion(0)]
    const files = [makeFakeFile()]
    render(
      <ReviewScreen
        items={makeItems()}
        skippedRegions={regions}
        sourceFiles={files}
        onConfirm={vi.fn()}
      />
    )

    // Heading should mention the count
    expect(screen.getByText(/2 items couldn't be read/i)).toBeInTheDocument()
  })
})
