import '@testing-library/jest-dom'

// jsdom does not implement DataTransfer (used in file input tests).
// This minimal polyfill supports the DataTransfer.items.add() + .files pattern.
class MockDataTransferItemList {
  private _files: File[] = []

  add(file: File) {
    this._files.push(file)
  }

  get length() {
    return this._files.length
  }
}

class MockDataTransfer {
  readonly items: MockDataTransferItemList
  private _files: File[]

  constructor() {
    this._files = []
    this.items = new Proxy(new MockDataTransferItemList(), {
      get: (target, prop) => {
        if (prop === 'add') {
          return (file: File) => {
            this._files.push(file)
          }
        }
        return (target as unknown as Record<string | symbol, unknown>)[prop]
      },
    })
  }

  get files(): FileList {
    const files = this._files
    return {
      length: files.length,
      item: (index: number) => files[index] ?? null,
      [Symbol.iterator]: function* () {
        for (const file of files) yield file
      },
      ...Object.fromEntries(files.map((f, i) => [i, f])),
    } as unknown as FileList
  }
}

// Only polyfill if not already defined (e.g. in real browser-like envs)
if (typeof globalThis.DataTransfer === 'undefined') {
  // @ts-expect-error — polyfill for jsdom
  globalThis.DataTransfer = MockDataTransfer
}
