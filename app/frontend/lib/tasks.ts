import type { MilestoneStatus, StatusCategory, TaskPriority } from "@/types"

export interface Option {
  value: string
  label: string
}

export const priorityLabels: Record<TaskPriority, string> = {
  no_priority: "No priority",
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
}

export const priorityOptions: Option[] = Object.entries(priorityLabels).map(
  ([value, label]) => ({ value, label }),
)

export const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  completed: "Completed",
  canceled: "Canceled",
}

export const milestoneBadgeVariant = {
  planned: "outline",
  in_progress: "info",
  completed: "success",
  canceled: "secondary",
} as const satisfies Record<MilestoneStatus, string>

export const milestoneStatusOptions: Option[] = Object.entries(
  milestoneStatusLabels,
).map(([value, label]) => ({ value, label }))

export function optionsFor(
  records: { id: number; name: string }[],
  noneLabel?: string,
): Option[] {
  const options = records.map((record) => ({
    value: String(record.id),
    label: record.name,
  }))

  return noneLabel ? [{ value: "", label: noneLabel }, ...options] : options
}

// Dates arrive as "YYYY-MM-DD"; format without shifting into the local timezone.
export function formatDate(date: string | null) {
  if (!date) return null

  const [year, month, day] = date.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export function isOverdue(date: string | null) {
  return !!date && date < new Date().toISOString().slice(0, 10)
}

// Used to group tasks from several projects, whose statuses differ.
export const categoryLabels: Record<StatusCategory, string> = {
  backlog: "Backlog",
  unstarted: "Todo",
  started: "In progress",
  completed: "Done",
  canceled: "Canceled",
}
