import { type DragEvent, useRef, useState } from "react"

// Dropping files from the computer onto an element. `dragging` is true while
// files are held over it; spread `dragHandlers` onto the element. dragenter and
// dragleave fire for every child, so they are counted and the state only
// clears when the pointer leaves the zone.
export function useFileDragZone(onFiles: (files: FileList) => void) {
  const [dragging, setDragging] = useState(false)
  const depth = useRef(0)

  // Only files from outside count, not text or a card dragged on the page.
  const isFileDrag = (event: DragEvent) =>
    event.dataTransfer.types.includes("Files")

  const dragHandlers = {
    onDragEnter(event: DragEvent) {
      if (!isFileDrag(event)) return
      depth.current += 1
      setDragging(true)
    },
    onDragOver(event: DragEvent) {
      if (!isFileDrag(event)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = "copy"
    },
    onDragLeave(event: DragEvent) {
      if (!isFileDrag(event)) return
      depth.current -= 1
      if (depth.current <= 0) {
        depth.current = 0
        setDragging(false)
      }
    },
    onDrop(event: DragEvent) {
      depth.current = 0
      setDragging(false)
      // A drop onto an editor inside the zone is the editor's to handle.
      if (event.defaultPrevented || !isFileDrag(event)) return
      event.preventDefault()
      if (event.dataTransfer.files.length > 0) onFiles(event.dataTransfer.files)
    },
  }

  return { dragging, dragHandlers }
}
