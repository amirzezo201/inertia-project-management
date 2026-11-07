import { DndContext, type DragEndEvent } from "@dnd-kit/core"
import { router } from "@inertiajs/react"
import { useEffect, useMemo, useState } from "react"

import { useDndSensors } from "@/lib/dnd"
import { taskPositionPath } from "@/routes"
import type {
  MilestoneOption,
  Option,
  ProjectOption,
  Status,
  TaskSummary,
} from "@/types"
import * as storage from "@/utils/storage"

import {
  type BoardDropData,
  type BoardMove,
  boardCollision,
  collapsedColumnsKey,
  tasksByStatus,
} from "../../utils/board"
import { TaskBoardCardOverlay } from "./TaskBoardCardOverlay"
import { TaskBoardCollapsedColumn } from "./TaskBoardCollapsedColumn"
import { TaskBoardColumn } from "./TaskBoardColumn"

export interface TaskBoardProps {
  project: ProjectOption
  tasks: TaskSummary[]
  statuses: Status[]
  milestones: MilestoneOption[]
  users: Option[]
}

const NO_TASKS: TaskSummary[] = []

// The kanban board: one column per status, in a horizontal row. Drag a card to
// another column to change its status, or between cards to reorder it. The move
// shows at once and is saved in the background.
export function TaskBoard({
  project,
  tasks,
  statuses,
  milestones,
  users,
}: TaskBoardProps) {
  const sensors = useDndSensors()
  const [activeId, setActiveId] = useState<number | null>(null)
  // A pending move holds only against the tasks it was made on: fresh props
  // from the server already contain the saved move.
  const [pending, setPending] = useState<{
    from: TaskSummary[]
    move: BoardMove
  } | null>(null)
  const move = pending?.from === tasks ? pending.move : null

  // Read after mount: the page is server-rendered, and a stored value read
  // during the first render would not match the server markup.
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set())
  useEffect(() => {
    const stored = storage.getItem(collapsedColumnsKey(project.id))
    setCollapsed(new Set(stored ? (JSON.parse(stored) as number[]) : []))
  }, [project.id])
  function toggleCollapsed(statusId: number, collapse: boolean) {
    const next = new Set(collapsed)
    if (collapse) next.add(statusId)
    else next.delete(statusId)
    setCollapsed(next)
    storage.setItem(collapsedColumnsKey(project.id), JSON.stringify([...next]))
  }

  const columns = useMemo(
    () => tasksByStatus(statuses, tasks, move),
    [statuses, tasks, move],
  )
  const statusById = useMemo(
    () => new Map(statuses.map((status) => [status.id, status])),
    [statuses],
  )
  const milestoneById = useMemo(
    () => new Map(milestones.map((milestone) => [milestone.id, milestone])),
    [milestones],
  )
  const userById = useMemo(
    () => new Map(users.map((user) => [user.value, user])),
    [users],
  )

  function moveTask(taskId: number, status: Status, beforeId: number | null) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Dropping a card back where it already is changes nothing.
    const column = columns.get(status.id) ?? NO_TASKS
    const at = column.findIndex((t) => t.id === taskId)
    if (at !== -1 && (column[at + 1]?.id ?? null) === beforeId) return

    setPending({ from: tasks, move: { taskId, statusId: status.id, beforeId } })
    router.patch(
      taskPositionPath(taskId),
      { status_id: status.id, before_id: beforeId },
      {
        preserveScroll: true,
        preserveState: true,
        onError: () => setPending(null),
      },
    )
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const data = e.over?.data.current as BoardDropData | undefined
    data?.onDrop(Number(e.active.id))
  }

  const active =
    activeId != null ? (tasks.find((t) => t.id === activeId) ?? null) : null

  return (
    <DndContext
      // A fixed id keeps dnd-kit's generated aria ids the same on the server
      // and in the browser.
      id={`task-board-${project.id}`}
      sensors={sensors}
      collisionDetection={boardCollision}
      onDragStart={(e) => setActiveId(Number(e.active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={onDragEnd}
    >
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-4">
        {statuses.map((status) => {
          const statusTasks = columns.get(status.id) ?? NO_TASKS
          return collapsed.has(status.id) ? (
            <TaskBoardCollapsedColumn
              key={status.id}
              status={status}
              count={statusTasks.length}
              onExpand={() => toggleCollapsed(status.id, false)}
            />
          ) : (
            <TaskBoardColumn
              key={status.id}
              project={project}
              status={status}
              tasks={statusTasks}
              milestoneById={milestoneById}
              userById={userById}
              onMove={moveTask}
              onCollapse={() => toggleCollapsed(status.id, true)}
            />
          )
        })}
      </div>

      <TaskBoardCardOverlay
        task={active}
        status={active ? statusById.get(active.status_id) : undefined}
        milestone={
          active?.milestone_id != null
            ? milestoneById.get(active.milestone_id)
            : undefined
        }
        assignee={
          active?.assignee_id != null
            ? userById.get(String(active.assignee_id))
            : undefined
        }
      />
    </DndContext>
  )
}
