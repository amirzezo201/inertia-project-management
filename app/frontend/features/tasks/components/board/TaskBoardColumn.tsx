import { useDndContext, useDroppable } from "@dnd-kit/core"
import { ChevronsRightLeft, Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  MilestoneOption,
  Option,
  ProjectOption,
  Status,
  TaskSummary,
} from "@/types"

import { COLUMN_WIDTH } from "../../utils/board"
import { TaskQuickAdd } from "../TaskQuickAdd"
import { TaskStatusIcon } from "../TaskStatusIcon"
import { TaskBoardCard } from "./TaskBoardCard"
import { TaskBoardCardDropSlot } from "./TaskBoardCardDropSlot"
import { TaskBoardDropLine } from "./TaskBoardDropLine"

// One board column: a header, then its cards. The column itself is the append
// drop target; each card's slot inserts before that card.
export function TaskBoardColumn({
  project,
  status,
  tasks,
  milestoneById,
  userById,
  onMove,
  onCollapse,
}: {
  project: ProjectOption
  status: Status
  tasks: TaskSummary[]
  milestoneById: Map<number, MilestoneOption>
  userById: Map<string, Option>
  onMove: (taskId: number, status: Status, beforeId: number | null) => void
  onCollapse: () => void
}) {
  const [adding, setAdding] = useState(false)
  const columnId = `col:${status.id}`
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { onDrop: (id: number) => onMove(id, status, null) },
  })
  // Collision prefers a card over its column, so the column's own `isOver`
  // drops out over a card. It counts as hovered over any of its cards too.
  const { over } = useDndContext()
  const overId = over ? String(over.id) : null
  const hovered =
    overId === columnId || tasks.some((task) => overId === `card:${task.id}`)

  return (
    <section
      aria-label={status.name}
      className="group/column flex shrink-0 flex-col rounded-md bg-kanban-column px-3 py-2"
      style={{ width: COLUMN_WIDTH }}
    >
      <header className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-foreground text-sm">
          <TaskStatusIcon category={status.category} className="size-3.5" />
          {status.name}
          <span className="text-muted-foreground text-xs">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={onCollapse}
            aria-label={`Collapse ${status.name}`}
            title="Collapse"
          >
            <ChevronsRightLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={() => setAdding(true)}
            aria-label={`New task in ${status.name}`}
            title="New task"
          >
            <Plus />
          </Button>
        </div>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "relative flex min-h-24 flex-1 flex-col rounded-md transition-colors",
          hovered && "bg-kanban-column-raised",
        )}
      >
        {tasks.map((task) => (
          <TaskBoardCardDropSlot
            key={task.id}
            taskId={task.id}
            onDrop={(id) => onMove(id, status, task.id)}
          >
            <TaskBoardCard
              task={task}
              status={status}
              milestone={
                task.milestone_id != null
                  ? milestoneById.get(task.milestone_id)
                  : undefined
              }
              assignee={
                task.assignee_id != null
                  ? userById.get(String(task.assignee_id))
                  : undefined
              }
            />
          </TaskBoardCardDropSlot>
        ))}

        {isOver && tasks.length > 0 && (
          <div className="relative h-2">
            <TaskBoardDropLine className="top-[3px]" />
          </div>
        )}

        <div className="pt-2">
          {adding ? (
            <TaskQuickAdd
              project={project}
              statusId={status.id}
              open
              onOpenChange={setAdding}
              compact
            />
          ) : (
            <Button
              variant="outline"
              className="invisible w-full text-muted-foreground opacity-0 group-focus-within/column:visible group-focus-within/column:opacity-100 group-hover/column:visible group-hover/column:opacity-100"
              onClick={() => setAdding(true)}
              aria-label={`New task in ${status.name}`}
            >
              <Plus />
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
