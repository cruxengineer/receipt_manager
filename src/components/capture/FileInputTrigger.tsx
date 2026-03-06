import { useRef } from 'react'
import { ImageUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileInputTriggerProps {
  onFilesSelected: (files: FileList | null) => void
  disabled?: boolean
}

/**
 * Hidden file input + visible Button.
 * IMPORTANT: inputRef.current?.click() is called directly in onClick (synchronous).
 * Do NOT wrap in setTimeout or Promise — iOS Safari requires the file picker to be
 * triggered from a synchronous user gesture handler (see RESEARCH.md Pitfall 3).
 *
 * No `capture` attribute — iOS shows "Take Photo", "Photo Library", "Browse" without it,
 * satisfying both CAPT-01 (upload) and CAPT-02 (camera) in one tap.
 */
export function FileInputTrigger({ onFilesSelected, disabled }: FileInputTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(e.target.files)
    // Reset input value so re-selecting the same file triggers onChange again
    // (see RESEARCH.md Open Question 2)
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />
      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        className="w-full"
        size="default"
      >
        <ImageUp className="mr-2 size-5" aria-hidden="true" />
        Add Receipt Photo
      </Button>
    </>
  )
}
