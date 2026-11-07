import { router } from "@inertiajs/react"
import { Flag, ListTree, UserRound } from "lucide-react"
import { DatePill } from "@/components/common/fields/DatePill"
import {
  type PillOption,
  PillSelect,
} from "@/components/common/fields/PillSelect"
import { UserAvatar } from "@/components/common/UserAvatar"
import { cn } from "@/lib/utils"
import { taskPath } from "@/routes"
import type { MilestoneOption, Option, Status, TaskSummary } from "@/types"
import { isOverdue } from "@/utils/tasks"

import {
  priorityPillOptions,
  statusPillOptions,
} from "../utils/taskPillOptions"

function saveTask(task: TaskSummary, attributes: Record<string, string>) {
  router.patch(taskPath(task.id), attributes, {
    preserveScroll: true,
    preserveState: true,
  })
}

function assigneeChipOptions(users: Option[]): PillOption[] {
  return [
    {
      value: "",
      label: "Unassigned",
      icon: <UserRound className="text-muted-foreground" />,
    },
    ...users.map((user) => ({
      value: user.value,
      label: user.label,
      icon: <UserAvatar name={user.label} className="size-4" />,
    })),
  ]
}

function milestoneChipOptions(milestones: MilestoneOption[]): PillOption[] {
  const icon = <Flag className="text-muted-foreground" />
  return [
    { value: "", label: "Milestone", icon },
    ...milestones.map((m) => ({ value: String(m.id), label: m.name, icon })),
  ]
}

interface TaskPropertiesProps {
  task: TaskSummary
  statuses: Status[]
  milestones: MilestoneOption[]
  users: Option[]
  hideMilestone?: boolean
  // Board cards wrap every chip onto lines; list rows drop some on small screens.
  wrap?: boolean
  className?: string
}

// The editable property chips of a task (Plane's list row / card chips).
export function TaskProperties({
  task,
  statuses,
  milestones,
  users,
  hideMilestone,
  wrap = false,
  className,
}: TaskPropertiesProps) {
  const projectStatuses = statuses.filter(
    (s) => s.project_id === task.project_id,
  )
  const projectMilestones = milestones.filter(
    (m) => m.project_id === task.project_id,
  )
  const status = projectStatuses.find((s) => s.id === task.status_id)
  const closed =
    status?.category === "completed" || status?.category === "canceled"

  return (
    <div
      className={cn(
        "relative z-[1] flex items-center gap-1.5",
        wrap && "flex-wrap",
        className,
      )}
    >
      {task.subtasks_count > 0 && (
        <span
          className={cn(
            "h-6 items-center gap-1 rounded-md border px-1.5 text-muted-foreground text-xs",
            wrap ? "inline-flex" : "hidden sm:inline-flex",
          )}
          title={`${task.subtasks_count} sub-tasks`}
        >
          <ListTree className="size-3.5" />
          {task.subtasks_count}
        </span>
      )}
      <PillSelect
        variant="chip"
        label="Status"
        value={String(task.status_id)}
        options={statusPillOptions(projectStatuses)}
        onChange={(value) => saveTask(task, { status_id: value })}
      />
      <PillSelect
        variant="chip"
        iconOnly
        label="Priority"
        value={task.priority}
        options={priorityPillOptions()}
        onChange={(value) => saveTask(task, { priority: value })}
      />
      <div className={wrap ? undefined : "hidden md:block"}>
        <DatePill
          variant="chip"
          label="Due date"
          value={task.due_date ?? ""}
          className={cn(
            !closed &&
              isOverdue(task.due_date) &&
              "text-destructive-foreground",
          )}
          onChange={(value) => saveTask(task, { due_date: value })}
        />
      </div>
      {!hideMilestone && (
        <div className={wrap ? undefined : "hidden lg:block"}>
          <PillSelect
            variant="chip"
            label="Milestone"
            value={String(task.milestone_id ?? "")}
            options={milestoneChipOptions(projectMilestones)}
            onChange={(value) => saveTask(task, { milestone_id: value })}
          />
        </div>
      )}
      <PillSelect
        variant="chip"
        iconOnly
        label="Assignee"
        value={String(task.assignee_id ?? "")}
        options={assigneeChipOptions(users)}
        onChange={(value) => saveTask(task, { assignee_id: value })}
      />
    </div>
  )
}
