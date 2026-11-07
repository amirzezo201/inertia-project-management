import { useEffect, useRef } from "react"

// Files pasted anywhere on the page while it is mounted. A paste inside a
// rich-text editor is left to the editor, which embeds images where the caret is.
export function useFilePaste(onFiles: (files: FileList) => void) {
  // Read through a ref: the listener is registered once.
  const onFilesRef = useRef(onFiles)
  onFilesRef.current = onFiles

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const files = event.clipboardData?.files
      if (!files || files.length === 0) return
      if (
        event.target instanceof Element &&
        event.target.closest(".ProseMirror")
      )
        return
      event.preventDefault()
      onFilesRef.current(files)
    }

    document.addEventListener("paste", onPaste)
    return () => document.removeEventListener("paste", onPaste)
  }, [])
}
