import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useReceiptFiles } from './useReceiptFiles'

// Helper: create a fake File object
function makeFile(name: string, type = 'image/jpeg'): File {
  return new File(['content'], name, { type })
}

function makeFileList(files: File[]): FileList {
  const dt = new DataTransfer()
  files.forEach((f) => dt.items.add(f))
  return dt.files
}

describe('useReceiptFiles', () => {
  it('starts with empty files array', () => {
    const { result } = renderHook(() => useReceiptFiles())
    expect(result.current.files).toHaveLength(0)
  })

  it('addFiles adds a single file (CAPT-01)', () => {
    const { result } = renderHook(() => useReceiptFiles())
    const list = makeFileList([makeFile('receipt.jpg')])
    act(() => result.current.addFiles(list))
    expect(result.current.files).toHaveLength(1)
    expect(result.current.files[0].file.name).toBe('receipt.jpg')
    expect(result.current.files[0].preview).toMatch(/^blob:/)
    expect(result.current.files[0].id).toBeTruthy()
  })

  it('addFiles appends multiple files without replacing (CAPT-03)', () => {
    const { result } = renderHook(() => useReceiptFiles())
    act(() => result.current.addFiles(makeFileList([makeFile('a.jpg')])))
    act(() => result.current.addFiles(makeFileList([makeFile('b.jpg'), makeFile('c.jpg')])))
    expect(result.current.files).toHaveLength(3)
  })

  it('removeFile removes only the targeted file by id', () => {
    const { result } = renderHook(() => useReceiptFiles())
    act(() => result.current.addFiles(makeFileList([makeFile('a.jpg'), makeFile('b.jpg')])))
    const idToRemove = result.current.files[0].id
    act(() => result.current.removeFile(idToRemove))
    expect(result.current.files).toHaveLength(1)
    expect(result.current.files[0].id).not.toBe(idToRemove)
  })

  it('clearFiles empties the array', () => {
    const { result } = renderHook(() => useReceiptFiles())
    act(() => result.current.addFiles(makeFileList([makeFile('a.jpg'), makeFile('b.jpg')])))
    act(() => result.current.clearFiles())
    expect(result.current.files).toHaveLength(0)
  })

  it('filters out non-image files', () => {
    const { result } = renderHook(() => useReceiptFiles())
    const list = makeFileList([makeFile('doc.pdf', 'application/pdf'), makeFile('img.jpg', 'image/jpeg')])
    act(() => result.current.addFiles(list))
    expect(result.current.files).toHaveLength(1)
    expect(result.current.files[0].file.name).toBe('img.jpg')
  })
})
