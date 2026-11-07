import { Link } from "@inertiajs/react"

import { PriorityIcon } from "@/components/tasks/priority-icon"
import { StatusIcon } from "@/components/tasks/status-icon"
import { Badge } from "@/components/ui/badge"
import { categoryLabels, formatDate, isOverdue } from "@/lib/tasks"
import { cn } from "@/lib/utils"
import { taskPath } from "@/routes"
import type {
  Milestone,
  Status,
  StatusCategory,
  Task,
  UserSummary,
} from "@/types"

interface TaskListProps {
  tasks: Task[]
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
  hideMilestone?: boolean
  // Projects have their own statuses, so lists spanning projects group by
  // status category (Backlog, Todo, In progress, …) instead.
  groupBy?: "status" | "category"
}

interface TaskGroup {
  key: string
  label: string
  category: StatusCategory
  tasks: Task[]
}

// Tasks grouped under their status, in workflow order (like Huly's issue list).
export function TaskList({
  tasks,
  statuses,
  milestones,
  users,
  hideMilestone,
  groupBy = "status",
}: TaskListProps) {
  const statusOf = (task: Task) => statuses.find((s) => s.id === task.status_id)

  const groups: TaskGroup[] =
    groupBy === "category"
      ? (Object.keys(categoryLabels) as StatusCategory[]).map((category) => ({
          key: category,
          label: categoryLabels[category],
          category,
          tasks: tasks.filter((task) => statusOf(task)?.category === category),
        }))
      : statuses.map((status) => ({
          key: String(status.id),
          label: status.name,
          category: status.category,
          tasks: tasks.filter((task) => task.status_id === status.id),
        }))

  return (
    <div className="flex flex-col gap-6">
      {groups
        .filter((group) => group.tasks.length > 0)
        .map((group) => (
          <section key={group.key}>
            <h2 className="mb-1 flex items-center gap-2 px-2 font-medium text-sm">
              <StatusIcon category={group.category} />
              {group.label}
              <span className="text-muted-foreground">
                {group.tasks.length}
              </span>
            </h2>

            <ul className="divide-y rounded-lg border">
              {group.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  status={statusOf(task) as Status}
                  milestone={
                    hideMilestone
                      ? undefined
                      : milestones.find((m) => m.id === task.milestone_id)
                  }
                  assignee={users.find((u) => u.id === task.assignee_id)}
                />
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}

interface TaskRowProps {
  task: Task
  status: Status
  milestone?: Milestone
  assignee?: UserSummary
}

export function TaskRow({ task, status, milestone, assignee }: TaskRowProps) {
  const closed =
    status.category === "completed" || status.category === "canceled"

  return (
    <li>
      <Link
        href={taskPath(task.id)}
        prefetch
        className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent/50"
      >
        <PriorityIcon priority={task.priority} />
        <span className="min-w-16 shrink-0 whitespace-nowrap text-muted-foreground tabular-nums">
          {task.identifier}
        </span>
        <StatusIcon category={status.category} />
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            closed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>

        {task.subtasks_count > 0 && (
          <span className="text-muted-foreground text-xs">
            {task.subtasks_count} sub
          </span>
        )}
        {milestone && (
          <Badge variant="outline" className="hidden sm:inline-flex">
            {milestone.name}
          </Badge>
        )}
        {task.due_date && (
          <span
            className={cn(
              "text-xs",
              !closed && isOverdue(task.due_date)
                ? "text-destructive-foreground"
                : "text-muted-foreground",
            )}
          >
            {formatDate(task.due_date)}
          </span>
        )}
        <span className="hidden w-28 truncate text-right text-muted-foreground text-xs md:block">
          {assignee?.name ?? "Unassigned"}
        </span>
      </Link>
    </li>
  )
}
