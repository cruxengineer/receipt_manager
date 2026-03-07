import type { ReceiptItem } from '@/types/ai'

export interface ItemAssignment {
  item: ReceiptItem
  assignee: 'A' | 'B' | 'split'
}

export type SwipeAssignments = ItemAssignment[]
