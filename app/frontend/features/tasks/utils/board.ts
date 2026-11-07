import {
  type Active,
  type CollisionDetection,
  pointerWithin,
} from "@dnd-kit/core"

import type { Status, TaskSummary } from "@/types"

// Width of one board column.
export const COLUMN_WIDTH = 348

// What a drop target does with the dropped task. A column appends; a card slot
// inserts before its card.
export interface BoardDropData {
  onDrop: (taskId: number) => void
}

export function draggedId(active: Active | null): number | null {
  return active ? Number(active.id) : null
}

// Card slots sit inside their column, so the pointer is over both. Prefer the
// card so hovering one inserts before it; empty column space falls through to
// the column (append).
export const boardCollision: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  const card = hits.find((hit) => String(hit.id).startsWith("card:"))
  return card ? [card] : hits
}

// A pending move, shown at once while the server saves it.
export interface BoardMove {
  taskId: number
  statusId: number
  beforeId: number | null
}

// Each status's tasks in board order, with a pending move applied.
export function tasksByStatus(
  statuses: Status[],
  tasks: TaskSummary[],
  move: BoardMove | null,
): Map<number, TaskSummary[]> {
  const moved = move ? tasks.find((task) => task.id === move.taskId) : undefined
  const rest = moved ? tasks.filter((task) => task !== moved) : tasks
  const columns = new Map(
    statuses.map((status) => [
      status.id,
      rest.filter((task) => task.status_id === status.id),
    ]),
  )

  if (move && moved) {
    const column = columns.get(move.statusId)
    if (column) {
      const at = column.findIndex((task) => task.id === move.beforeId)
      column.splice(at === -1 ? column.length : at, 0, {
        ...moved,
        status_id: move.statusId,
      })
    }
  }

  return columns
}

// Collapsed columns are a per-project, client-only preference.
export function collapsedColumnsKey(projectId: number) {
  return `board-collapsed:${projectId}`
}
