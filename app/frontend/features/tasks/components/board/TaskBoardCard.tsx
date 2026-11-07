import { useDraggable } from "@dnd-kit/core"
import { router } from "@inertiajs/react"
import { memo, useRef } from "react"

import { DRAG_ACTIVATION_DISTANCE } from "@/lib/dnd"
import { cn } from "@/lib/utils"
import { taskPath } from "@/routes"
import type { MilestoneOption, Option, Status, TaskSummary } from "@/types"

import { TaskBoardCardBody } from "./TaskBoardCardBody"

// A draggable board card. Dragging it moves the task; a plain click opens it.
// Memoized: the board re-renders on every drag step.
export const TaskBoardCard = memo(function TaskBoardCard({
  task,
  status,
  milestone,
  assignee,
}: {
  task: TaskSummary
  status?: Status
  milestone?: MilestoneOption
  assignee?: Option
}) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: task.id,
  })

  // The browser still fires a click after a drag ends, which would open the
  // task the moment it is dropped. Ignore a click that moved further than the
  // drag activation distance.
  const pressedAt = useRef<{ x: number; y: number } | null>(null)
  function isClick(e: { clientX: number; clientY: number }) {
    const start = pressedAt.current
    pressedAt.current = null
    return (
      !start ||
      Math.hypot(e.clientX - start.x, e.clientY - start.y) <=
        DRAG_ACTIVATION_DISTANCE
    )
  }

  function open() {
    router.visit(taskPath(task.id))
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useAriaPropsSupportedByRole: dnd-kit's attributes give the card role="button" and tabIndex
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`${task.identifier} ${task.title}`}
      onPointerDownCapture={(e) => {
        pressedAt.current = { x: e.clientX, y: e.clientY }
      }}
      onClick={(e) => {
        if (isClick(e)) open()
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") open()
        else listeners?.onKeyDown?.(e)
      }}
      className={cn(
        "kanban-card cursor-grab select-none rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "opacity-40",
      )}
    >
      <TaskBoardCardBody
        task={task}
        status={status}
        milestone={milestone}
        assignee={assignee}
      />
    </div>
  )
})
