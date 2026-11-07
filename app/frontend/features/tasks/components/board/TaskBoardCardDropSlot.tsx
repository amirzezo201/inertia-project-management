import { useDroppable } from "@dnd-kit/core"
import type { ReactNode } from "react"

import { draggedId } from "../../utils/board"
import { TaskBoardDropLine } from "./TaskBoardDropLine"

// The drop target for inserting before one card. It wraps the card and the gap
// above it, so a pointer in that gap still targets this card instead of falling
// through to the column (append).
export function TaskBoardCardDropSlot({
  taskId,
  onDrop,
  children,
}: {
  taskId: number
  onDrop: (taskId: number) => void
  children: ReactNode
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `card:${taskId}`,
    data: { onDrop: (id: number) => id !== taskId && onDrop(id) },
  })
  // Dropping a card on itself is a no-op, so it gets no marker.
  const showDropLine = isOver && draggedId(active) !== taskId

  return (
    <div ref={setNodeRef} className="relative pt-2">
      {showDropLine && <TaskBoardDropLine className="top-[3px]" />}
      {children}
    </div>
  )
}
