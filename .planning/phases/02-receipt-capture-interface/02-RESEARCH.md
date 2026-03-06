# Phase 2: Receipt Capture Interface - Research

**Researched:** 2026-03-05
**Domain:** File input / camera capture on mobile web, React image state management
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- App opens directly to the capture screen — no separate welcome/landing screen
- Keep it immediate: one clear action to start
- Primary use case: iPhone Safari — native `<input type="file" accept="image/*">` is the mechanism

### Claude's Discretion
- Single button or two options — optimize for mobile (native file picker on iOS includes camera option)
- Multiple receipts (CAPT-03): add before or after processing — keep it simple
- Image preview or immediate submission
- Loading state design (spinner, skeleton, progress)
- Error message copy for unreadable receipts
- Exact layout of capture screen within max-w-md card pattern

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CAPT-01 | User can upload receipt photo from device | `<input type="file" accept="image/*">` + file state management |
| CAPT-02 | User can capture receipt photo using device camera | Same input — iOS shows camera as an option in the native sheet |
| CAPT-03 | User can upload multiple receipt images from same meal | `multiple` attribute on file input + FileWithPreview[] state array |
| CAPT-04 | User sees loading state while AI processes image | `isProcessing` boolean state + SVG spinner with `animate-spin` |
| CAPT-05 | User sees clear error with retry option if receipt is unreadable | Error state string + retry button that resets state |
</phase_requirements>

---

## Summary

This phase builds the entry point of ReceiptSplit: the screen where a user selects or photographs a receipt. The entire mechanism rests on a single native HTML primitive — `<input type="file" accept="image/*">` — which on iOS Safari presents a native action sheet giving users the option to take a photo, choose from their photo library, or browse iCloud. No third-party file picker library is needed or advisable.

Multi-image support (CAPT-03) uses the `multiple` attribute on the same input, which has full support on iOS Safari 6.0+ (all relevant iOS versions). Preview generation uses `URL.createObjectURL` rather than `FileReader` because it is synchronous, memory-efficient, and works for all image MIME types. Object URLs must be revoked on unmount and on individual file removal to prevent memory leaks.

The loading and error states for CAPT-04 and CAPT-05 are pure React state: `isProcessing: boolean` and `error: string | null`. Tailwind's built-in `animate-spin` class handles the spinner visual. No additional animation library is needed.

**Primary recommendation:** Use a single `<input type="file" accept="image/*" multiple>` hidden input, triggered by a full-width shadcn/ui Button. This gives iOS users camera + library access in one tap, handles multiple images natively, and requires zero external dependencies beyond what Phase 1 already installed.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (useState, useReducer, useRef, useEffect) | 19.2 (installed) | File state, preview URLs, input ref, URL cleanup | Already in project — no new dependencies |
| `<input type="file">` (HTML) | — | Camera + library access on iOS | Native, no JS overhead, iOS respects `accept="image/*"` |
| URL.createObjectURL / URL.revokeObjectURL | Browser API | Synchronous blob URL for image previews | Faster than FileReader, no base64 conversion |
| Tailwind `animate-spin` | v4 (installed) | Loading spinner | Built-in, no import needed |
| lucide-react | 0.576 (installed) | Camera, ImageUp, X, AlertCircle icons | Already installed, tree-shaken |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Button | installed | CTA button for triggering file input | Always — established project pattern (h-11, 44px touch target) |
| cn() utility | installed | Conditional class merging | Always — Tailwind v4 class composition |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<input type="file">` | react-dropzone | react-dropzone adds ~15KB, handles drag-and-drop; not needed for mobile-first; native covers all requirements |
| `URL.createObjectURL` | `FileReader` readAsDataURL | FileReader is async and produces base64 (larger); createObjectURL is synchronous and produces a compact blob URL |
| SVG + `animate-spin` | React spinner library | Zero-dependency; Tailwind built-in is sufficient |

**Installation:** No new packages required. All dependencies are already installed from Phase 1.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/
│   │   └── button.tsx          # existing — reuse as-is
│   └── capture/
│       ├── CaptureScreen.tsx   # top-level screen, owns all state
│       ├── FileInputTrigger.tsx # hidden input + visible button wrapper
│       ├── ImagePreviewList.tsx # thumbnails with remove buttons
│       └── UploadStatus.tsx    # loading spinner OR error message
├── hooks/
│   └── useReceiptFiles.ts      # file state, preview URLs, validation, cleanup
├── lib/
│   └── utils.ts                # existing cn() — no changes
└── App.tsx                     # replace test shell with <CaptureScreen />
```

### Pattern 1: Hidden File Input + Button Trigger
**What:** A visually hidden `<input type="file">` is programmatically triggered by a visible Button via `useRef`. The Button is what the user sees and taps; the native file picker opens invisibly.
**When to use:** Always for mobile — avoids styling the notoriously hard-to-style file input, gives full control over button appearance while preserving native OS behavior.

```typescript
// Source: MDN HTML file input, react.wiki/hooks/file-upload-hook
const inputRef = useRef<HTMLInputElement>(null);

const handleButtonClick = () => {
  inputRef.current?.click();
};

return (
  <>
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple
      className="sr-only"
      onChange={handleFileChange}
      // NOTE: Do NOT use capture="environment" — see Pitfall 1
    />
    <Button onClick={handleButtonClick} className="w-full">
      <ImageUp className="mr-2 size-5" />
      Add Receipt Photo
    </Button>
  </>
);
```

### Pattern 2: FileWithPreview State Shape
**What:** Each selected file is wrapped in an object containing the File, a blob URL for preview, and a stable unique ID for keyed rendering and individual removal.
**When to use:** Any time multiple file previews need to be rendered, updated, or removed independently.

```typescript
// Source: react.wiki/hooks/file-upload-hook (January 2025)
interface FileWithPreview {
  file: File;
  preview: string;       // URL.createObjectURL result
  id: string;            // stable key for React rendering
}
```

### Pattern 3: useReceiptFiles Hook
**What:** Centralizes all file state, preview URL creation, validation, and cleanup in a single custom hook. CaptureScreen becomes a pure rendering concern.

```typescript
// Source: react.wiki/hooks/file-upload-hook adapted for this project
function useReceiptFiles() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  // Revoke ALL object URLs on unmount (memory leak prevention)
  useEffect(() => {
    return () => {
      files.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, [files]);

  const addFiles = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles = Array.from(selected)
      .filter(validateImageFile)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview); // revoke immediately
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearFiles = () => {
    files.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setFiles([]);
  };

  return { files, addFiles, removeFile, clearFiles };
}
```

### Pattern 4: Processing + Error State
**What:** Two additional state values on CaptureScreen — one boolean for the in-progress state (CAPT-04), one nullable string for error messages (CAPT-05). The "retry" action clears error state and resets to the add-photos view.

```typescript
const [isProcessing, setIsProcessing] = useState(false);
const [error, setError] = useState<string | null>(null);

// Spinner (CAPT-04)
{isProcessing && (
  <div role="status" aria-live="polite" aria-label="Processing receipt">
    <svg className="animate-spin size-8 text-slate-600" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
    <p className="mt-2 text-sm text-slate-600">Reading your receipt…</p>
  </div>
)}

// Error (CAPT-05)
{error && (
  <div role="alert" className="rounded-md bg-red-50 border border-red-200 p-4">
    <div className="flex items-start gap-3">
      <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-800">{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={handleRetry}>
          Try again
        </Button>
      </div>
    </div>
  </div>
)}
```

### Anti-Patterns to Avoid
- **Using `capture="environment"` attribute:** On Android this bypasses the photo library entirely, forcing camera-only. On iOS it is inconsistently supported. Since the requirement is both camera AND upload (CAPT-01 + CAPT-02), omit the `capture` attribute — iOS's native picker presents all three options (camera, photo library, iCloud) without it.
- **FileReader for previews:** Async, base64-heavy, slower than `URL.createObjectURL`. Use `URL.createObjectURL` and revoke on cleanup.
- **Storing File objects in component state without preview cleanup:** Blob URLs created with `URL.createObjectURL` persist in browser memory until explicitly revoked. Always revoke in `useEffect` cleanup and on individual file removal.
- **Styling the `<input type="file">` element directly:** Appearance varies wildly across iOS/Android. Hide with `className="sr-only"` and trigger programmatically from a Button.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Camera + library access on iOS | Custom camera component, MediaDevices API | `<input type="file" accept="image/*">` | Native OS picker handles permissions, compression, HEIC conversion — zero code required |
| Image preview URLs | Base64 conversion with canvas | `URL.createObjectURL(file)` | Synchronous, no encoding overhead, browser manages the blob |
| Spinning loader | Custom CSS keyframes | Tailwind `animate-spin` | Already in Tailwind v4; no @keyframes authoring needed |
| Icon assets | SVG files, custom icons | `lucide-react` (already installed) | Camera, ImageUp, AlertCircle, X all exist in the installed version |

**Key insight:** This entire phase can be implemented with zero new npm packages. Every primitive needed (file input, blob URLs, Tailwind animation, lucide icons, shadcn Button) is already present.

---

## Common Pitfalls

### Pitfall 1: `capture` attribute locks out photo library on Android
**What goes wrong:** Using `<input type="file" accept="image/*" capture="environment">` on Android forces users directly into the camera app, removing the option to pick an existing photo. This would break CAPT-01 for Android users.
**Why it happens:** On Android, `capture` instructs the OS to open the camera directly. On iOS it is largely ignored in modern versions, but behavior is inconsistent.
**How to avoid:** Omit `capture` entirely. iOS Safari without `capture` presents a native action sheet: "Take Photo", "Photo Library", "Browse" — satisfying both CAPT-01 and CAPT-02 simultaneously.
**Warning signs:** User reports of "can only take photo, not choose from gallery."

### Pitfall 2: Memory leak from un-revoked object URLs
**What goes wrong:** `URL.createObjectURL(file)` creates a blob URL that persists in memory until the page is unloaded OR `URL.revokeObjectURL` is called. React's StrictMode double-mount will compound this.
**Why it happens:** Object URLs are reference-counted; they are not garbage collected when the component re-renders.
**How to avoid:** (a) Revoke in `useEffect` cleanup when `files` state changes; (b) Revoke immediately in `removeFile` when a specific file is removed; (c) Revoke all in `clearFiles` when resetting.
**Warning signs:** Memory usage climbs during testing as files are added/removed repeatedly.

### Pitfall 3: iOS file input requires user gesture
**What goes wrong:** Calling `inputRef.current?.click()` from inside a `setTimeout`, `Promise.then`, or any async context triggers a security block in iOS Safari — the file picker never opens.
**Why it happens:** iOS Safari requires file input activation to be directly within a synchronous user event handler (click).
**How to avoid:** Call `inputRef.current?.click()` directly inside the `onClick` handler, never inside a callback or async function.
**Warning signs:** File picker opens on desktop/Chrome but silently fails on iPhone Safari.

### Pitfall 4: `multiple` file selection behavior on iOS camera option
**What goes wrong:** When a user taps "Take Photo" in the iOS action sheet, iOS opens the camera for a single photo only — it does not support taking multiple photos in one camera session via the web.
**Why it happens:** iOS camera mode via file input is single-shot by design. `multiple` only applies to the Photo Library and Browse options.
**How to avoid:** Accept this as a platform limitation. Users can tap the add button multiple times to add more photos (each tap → one camera shot or multiple from library). Design the UI to support repeated adds clearly.
**Warning signs:** User confusion if UI says "add multiple" but camera always returns one.

### Pitfall 5: Showing an image preview before the file input `onChange` fires
**What goes wrong:** Attempting to display a preview optimistically using the input's `value` attribute — this is read-only and always returns a fake path (`C:\fakepath\...`) for security reasons.
**Why it happens:** Browsers sandbox file input values. Actual `File` objects are only available in the `onChange` event's `e.target.files`.
**How to avoid:** Always access files via `e.target.files` in the `onChange` handler, then call `URL.createObjectURL`.

---

## Code Examples

### Complete file input wiring (iOS-safe)
```typescript
// Source: web.dev/media-capturing-images, MDN capture attribute
<input
  ref={inputRef}
  type="file"
  accept="image/*"
  multiple
  className="sr-only"
  // No capture attribute — lets iOS show full action sheet
  onChange={(e) => addFiles(e.target.files)}
/>
```

### URL cleanup on unmount
```typescript
// Source: react.wiki/hooks/file-upload-hook
useEffect(() => {
  return () => {
    files.forEach(({ preview }) => URL.revokeObjectURL(preview));
  };
}, [files]);
```

### Accessible loading spinner
```typescript
// Source: MDN aria-live, codeaccessible.com/codepatterns/loading-spinner
<div role="status" aria-live="polite" aria-label="Processing receipt">
  <svg
    className="animate-spin size-8 text-slate-600"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
    />
  </svg>
  <p className="mt-2 text-sm text-slate-600">Reading your receipt…</p>
</div>
```

### File validation helper
```typescript
// Source: react.wiki/hooks/file-upload-hook adapted
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE_MB = 20;

function validateImageFile(file: File): boolean {
  if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return false; // accept anything image/* as fallback (HEIC type strings vary)
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return false;
  }
  return true;
}
```

### Tailwind v4 custom animation (if needed beyond animate-spin)
```css
/* Source: tailwindcss.com/docs/animation */
/* In src/index.css @theme block — only if custom animation needed */
@theme {
  --animate-fade-in: fade-in 0.2s ease-out;
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `capture="camera"` for mobile camera | Omit `capture`, use `accept="image/*"` | iOS 10+ (circa 2016) | Gives users camera + library choice; better UX |
| `FileReader` + `readAsDataURL` for previews | `URL.createObjectURL` | Widely adopted ~2018 | Synchronous, no base64, lower memory use |
| CSS `@keyframes` for spinners | Tailwind `animate-spin` | Tailwind v2+ | No custom CSS needed |
| Separate camera and gallery buttons | Single file input, native OS sheet | iOS standard | Simpler UI, fewer taps |
| Tailwind config.js for custom tokens | `@theme` in CSS (Tailwind v4) | Tailwind v4 (2024) | Already used in this project |

**Deprecated/outdated:**
- `capture="camera"`: Old syntax, superseded by `capture="environment"` / `capture="user"` — but even those should be omitted for this use case.
- `<input type="file" accept="image/png,image/jpeg">`: Overly restrictive. `accept="image/*"` is broader and correctly handles HEIC from iPhone cameras.

---

## Open Questions

1. **HEIC/HEIF from iPhone camera**
   - What we know: When an iPhone user takes a photo via the file picker in Safari, iOS may deliver the file as `image/heic` or `image/heif`. The browser handles display via `URL.createObjectURL` correctly (preview works). However, if Phase 3's AI API doesn't accept HEIC, conversion will be needed there.
   - What's unclear: Whether Claude Vision API (Phase 3) accepts HEIC natively or requires JPEG conversion.
   - Recommendation: Phase 2 should accept and preview HEIC files normally. Flag this as a Phase 3 integration concern. Do not add canvas-based conversion in Phase 2.

2. **Input reset for re-selecting same file**
   - What we know: If a user selects a file, removes it, then tries to select the same file again, the browser's `onChange` won't fire because the input's value hasn't changed.
   - What's unclear: Whether this edge case is worth handling in Phase 2.
   - Recommendation: Reset the input value after each selection: `e.target.value = ''` at the end of the `onChange` handler. This ensures re-selection always works.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed — Wave 0 must add Vitest + React Testing Library |
| Config file | `vitest.config.ts` — Wave 0 creates this |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAPT-01 | File input accepts image files from device | unit | `npx vitest run src/hooks/useReceiptFiles.test.ts` | Wave 0 |
| CAPT-02 | Input has correct accept="image/*" attribute | unit | `npx vitest run src/components/capture/CaptureScreen.test.tsx` | Wave 0 |
| CAPT-03 | Multiple files can be added to state array | unit | `npx vitest run src/hooks/useReceiptFiles.test.ts` | Wave 0 |
| CAPT-04 | isProcessing=true renders spinner, hides button | unit | `npx vitest run src/components/capture/CaptureScreen.test.tsx` | Wave 0 |
| CAPT-05 | error state renders error message + retry button | unit | `npx vitest run src/components/capture/CaptureScreen.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — configure jsdom environment and setup file
- [ ] `src/test/setup.ts` — `@testing-library/jest-dom` matchers
- [ ] `src/hooks/useReceiptFiles.test.ts` — covers CAPT-01, CAPT-03
- [ ] `src/components/capture/CaptureScreen.test.tsx` — covers CAPT-02, CAPT-04, CAPT-05
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

---

## Sources

### Primary (HIGH confidence)
- [MDN — HTML capture attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture) — capture values, iOS/Android behavior
- [web.dev — Capturing an image from the user](https://web.dev/media-capturing-images/) — iOS action sheet behavior without capture attribute
- [caniuse.com — input-file-multiple](https://caniuse.com/input-file-multiple) — iOS Safari 6+ full support confirmed
- [tailwindcss.com/docs/animation](https://tailwindcss.com/docs/animation) — animate-spin, v4 CSS-first custom animations
- [react.wiki/hooks/file-upload-hook](https://react.wiki/hooks/file-upload-hook) — FileWithPreview pattern, URL.createObjectURL cleanup

### Secondary (MEDIUM confidence)
- [MDN — aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live) — accessible loading state pattern
- [blog.addpipe.com — Correct Syntax HTML Media Capture](https://blog.addpipe.com/correct-syntax-html-media-capture/) — capture attribute syntax reference
- [lucide.dev/icons/camera](https://lucide.dev/icons/camera), [lucide.dev/icons/image-up](https://lucide.dev/icons/image-up) — confirmed icon names in installed version

### Tertiary (LOW confidence)
- Community reports of iOS camera session being single-shot (multiple only works in photo library selection) — needs device testing to confirm current behavior.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed; HTML file input is a stable API
- Architecture: HIGH — FileWithPreview + hook pattern verified via official React/browser APIs
- Pitfalls: HIGH for iOS capture attribute and memory leaks (verified with MDN + caniuse); MEDIUM for HEIC handling (Phase 3 concern, not directly tested)

**Research date:** 2026-03-05
**Valid until:** 2026-09-05 (stable browser APIs; re-verify if target iOS major version changes)
