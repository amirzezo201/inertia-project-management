import { Flag, UserRound } from "lucide-react"

import type { PillOption } from "@/components/property-pills"
import { PriorityIcon } from "@/components/tasks/priority-icon"
import { StatusIcon } from "@/components/tasks/status-icon"
import { milestoneStatusLabels, priorityLabels } from "@/lib/tasks"
import type {
  Milestone,
  MilestoneStatus,
  Status,
  TaskPriority,
  UserSummary,
} from "@/types"

export function statusPillOptions(statuses: Status[]): PillOption[] {
  return statuses.map((status) => ({
    value: String(status.id),
    label: status.name,
    icon: <StatusIcon category={status.category} />,
  }))
}

export function priorityPillOptions(): PillOption[] {
  return (Object.keys(priorityLabels) as TaskPriority[]).map((priority) => ({
    value: priority,
    label: priorityLabels[priority],
    icon: <PriorityIcon priority={priority} />,
  }))
}

// `emptyLabel` is what an unset value reads as: "Assignee" on a create
// dialog's button, "Unassigned" in a detail page's properties panel.
export function assigneePillOptions(
  users: UserSummary[],
  emptyLabel = "Assignee",
): PillOption[] {
  const icon = <UserRound className="size-4 text-muted-foreground" />
  return [
    { value: "", label: emptyLabel, icon },
    ...users.map((user) => ({
      value: String(user.id),
      label: user.name,
      icon,
    })),
  ]
}

export function milestonePillOptions(
  milestones: Milestone[],
  emptyLabel = "Milestone",
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
