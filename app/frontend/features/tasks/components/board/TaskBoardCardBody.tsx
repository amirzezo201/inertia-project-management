import {
  CalendarArrowUp,
  CalendarClock,
  Clock,
  Flag,
  ListTree,
} from "lucide-react"

import { UserAvatar } from "@/components/common/UserAvatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MilestoneOption, Option, Status, TaskSummary } from "@/types"
import { formatDate, isOverdue } from "@/utils/tasks"

import { TaskPriorityIcon } from "../TaskPriorityIcon"
import { TaskStatusIcon } from "../TaskStatusIcon"

// Outline pill shared by the card's meta badges.
const PILL = "rounded-full px-1.5 py-0.5 text-[10px] text-muted-foreground"

// One board card's content: identifier and priority, then status and title,
// then meta badges and the assignee. The drag preview renders it too.
export function TaskBoardCardBody({
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
  const closed =
    status?.category === "completed" || status?.category === "canceled"
  const overdue = !closed && isOverdue(task.due_date)
  const metaShown =
    task.start_date ||
    task.due_date ||
    milestone ||
    task.estimation > 0 ||
    task.subtasks_count > 0

  return (
    <>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{task.identifier}</span>
        {task.priority !== "no_priority" && (
          <TaskPriorityIcon priority={task.priority} className="size-3.5" />
        )}
      </div>

      <div className="mb-2 flex items-start gap-1.5">
        {status && (
          <span className="mt-px inline-flex shrink-0" title={status.name}>
            <TaskStatusIcon category={status.category} className="size-3.5" />
          </span>
        )}
        <span
          dir="auto"
          className="line-clamp-2 text-foreground text-sm leading-snug"
        >
          {task.title}
        </span>
      </div>

      {(metaShown || assignee) && (
        <div className="flex min-h-[22px] items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {task.start_date && (
              <Badge variant="outline" className={PILL} title="Start date">
                <CalendarArrowUp className="size-2.5" />
                {formatDate(task.start_date)}
              </Badge>
            )}
            {task.due_date && (
              <Badge
                variant="outline"
                title="Due date"
                className={cn(
                  PILL,
                  overdue &&
                    "border-transparent bg-overdue font-medium text-destructive-text",
                )}
              >
                <CalendarClock className="size-2.5" />
                {formatDate(task.due_date)}
              </Badge>
            )}
            {milestone && (
              <Badge variant="outline" className={cn(PILL, "max-w-full")}>
                <Flag className="size-2.5 shrink-0" />
                <span className="truncate">{milestone.name}</span>
              </Badge>
            )}
            {task.estimation > 0 && (
              <Badge variant="outline" className={PILL} title="Estimate">
                <Clock className="size-2.5" />
                {task.estimation}
              </Badge>
            )}
            {task.subtasks_count > 0 && (
              <Badge variant="outline" className={PILL} title="Subtasks">
                <ListTree className="size-2.5" />
                {task.subtasks_count}
              </Badge>
            )}
          </div>
          {assignee && (
            <span title={assignee.label} className="shrink-0">
              <UserAvatar
                name={assignee.label}
                className="size-5 ring-2 ring-[var(--kanban-card)]"
              />
            </span>
          )}
        </div>
      )}
    </>
  )
}
