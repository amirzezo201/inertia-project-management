import { Flag, UserRound } from "lucide-react"

import type { PillOption } from "@/components/common/fields/PillSelect"
import { TaskPriorityIcon } from "@/features/tasks/components/TaskPriorityIcon"
import { TaskStatusIcon } from "@/features/tasks/components/TaskStatusIcon"
import type {
  MilestoneOption,
  MilestoneStatus,
  Option,
  Status,
  TaskPriority,
} from "@/types"
import { milestoneStatusLabels, priorityLabels } from "@/utils/tasks"

export function statusPillOptions(statuses: Status[]): PillOption[] {
  return statuses.map((status) => ({
    value: String(status.id),
    label: status.name,
    icon: <TaskStatusIcon category={status.category} />,
  }))
}

export function priorityPillOptions(): PillOption[] {
  return (Object.keys(priorityLabels) as TaskPriority[]).map((priority) => ({
    value: priority,
    label: priorityLabels[priority],
    icon: <TaskPriorityIcon priority={priority} />,
  }))
}

// `emptyLabel` is what an unset value reads as: "Assignee" on a create
// dialog's button, "Unassigned" in a detail page's properties panel.
export function assigneePillOptions(
  users: Option[],
  emptyLabel = "Assignee",
): PillOption[] {
  const icon = <UserRound className="size-4 text-muted-foreground" />
  return [
    { value: "", label: emptyLabel, icon },
    ...users.map((user) => ({
      value: user.value,
      label: user.label,
      icon,
    })),
  ]
}

export function milestonePillOptions(
  milestones: MilestoneOption[],
  emptyLabel = "MilestoneOption",
): PillOption[] {
  const icon = <Flag className="size-4 text-muted-foreground" />
  return [
    { value: "", label: emptyLabel, icon },
    ...milestones.map((milestone) => ({
      value: String(milestone.id),
      label: milestone.name,
      icon,
    })),
  ]
}

export function milestoneStatusPillOptions(): PillOption[] {
  return (Object.keys(milestoneStatusLabels) as MilestoneStatus[]).map(
    (status) => ({
      value: status,
      label: milestoneStatusLabels[status],
    }),
  )
}
