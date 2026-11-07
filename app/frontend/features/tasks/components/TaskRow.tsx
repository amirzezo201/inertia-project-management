import { Link } from "@inertiajs/react"

import { taskPath } from "@/routes"
import type { MilestoneOption, Option, Status, TaskSummary } from "@/types"

import { TaskProperties } from "./TaskProperties"

export interface TaskRowProps {
  task: TaskSummary
  statuses: Status[]
  milestones: MilestoneOption[]
  users: Option[]
  hideMilestone?: boolean
  idWidth?: number
}

export function TaskRow({
  task,
  statuses,
  milestones,
  users,
  hideMilestone,
  idWidth,
}: TaskRowProps) {
  return (
    <li className="group/row relative flex min-h-11 items-center gap-3 border-b px-5 py-2 text-sm transition-colors last:border-b-0 hover:bg-accent/40">
      <span
        className="shrink-0 font-medium text-muted-foreground text-xs tabular-nums"
        style={idWidth ? { minWidth: `${idWidth}ch` } : undefined}
      >
        {task.identifier}
      </span>
      {/* The title link covers the row; chips sit above it so they stay clickable. */}
      <Link
        href={taskPath(task.id)}
        prefetch
        className="min-w-0 flex-1 truncate font-medium after:absolute after:inset-0"
      >
        {task.title}
      </Link>

      <TaskProperties
        task={task}
        statuses={statuses}
        milestones={milestones}
        users={users}
        hideMilestone={hideMilestone}
        className="shrink-0"
      />
    </li>
  )
}
