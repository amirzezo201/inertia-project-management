import { DragOverlay } from "@dnd-kit/core"

import type { MilestoneOption, Option, Status, TaskSummary } from "@/types"

import { TaskBoardCardBody } from "./TaskBoardCardBody"

// The card under the cursor while dragging. dropAnimation is off: the move is
// applied optimistically, so the card is already in its new place when the
// drag ends, and the default animation would fly it back to its old slot first.
export function TaskBoardCardOverlay({
  task,
  status,
  milestone,
  assignee,
}: {
  task: TaskSummary | null
  status?: Status
  milestone?: MilestoneOption
  assignee?: Option
}) {
  return (
    <DragOverlay dropAnimation={null}>
      {task ? (
        <div className="kanban-card cursor-grabbing rounded-md p-2 opacity-95 shadow-[var(--overlay-shadow)]">
          <TaskBoardCardBody
            task={task}
            status={status}
            milestone={milestone}
            assignee={assignee}
          />
        </div>
      ) : null}
    </DragOverlay>
  )
}
