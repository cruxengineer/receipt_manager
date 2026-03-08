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

// jsdom does not implement URL.createObjectURL / revokeObjectURL.
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:mock'
  URL.revokeObjectURL = () => {}
}

// jsdom does not render images — stub Image so onload fires immediately with 1×1 dimensions.
class MockImage {
  naturalWidth = 1
  naturalHeight = 1
  onload: (() => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  set src(_url: string) {
    // Fire onload asynchronously so the Promise chain can set up the handler first.
    setTimeout(() => this.onload?.(), 0)
  }
}

// jsdom does not implement canvas rendering — stub at prototype level so individual tests
// can still override via HTMLCanvasElement.prototype.getContext (prototype-level mocks win
// over setup stubs when the test re-assigns the prototype property in beforeEach).
HTMLCanvasElement.prototype.getContext = (() => ({ drawImage: () => {} })) as unknown as typeof HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,/9j/mockbase64=='

// jsdom defines Image but never fires onload for blob/object URLs — always replace.
// @ts-expect-error — replace jsdom's Image with a mock that fires onload synchronously
globalThis.Image = MockImage
