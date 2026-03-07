/** A single line item extracted from a receipt. */
export interface ReceiptItem {
  name: string
  price: number
}

/**
 * A receipt region the AI could not confidently read.
 * imageIndex is 0-based index into the files[] array passed to parseReceipt.
 * boundingBox values are 0..1 fractions of the image dimensions (top-left origin).
 */
export interface SkippedRegion {
  imageIndex: number
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ParseReceiptResult {
  items: ReceiptItem[]
  skippedRegions: SkippedRegion[]
}
