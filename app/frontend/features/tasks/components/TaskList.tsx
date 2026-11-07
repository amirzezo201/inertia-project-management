import type {
  MilestoneOption,
  Option,
  ProjectOption,
  Status,
  StatusCategory,
  TaskSummary,
} from "@/types"
import { categoryLabels } from "@/utils/tasks"

import { TaskListGroupSection } from "./TaskListGroupSection"

interface TaskListProps {
  tasks: TaskSummary[]
  statuses: Status[]
  milestones: MilestoneOption[]
  users: Option[]
  hideMilestone?: boolean
  // Projects have their own statuses, so lists spanning projects group by
  // status category (Backlog, Todo, In progress, …) instead.
  groupBy?: "status" | "category"
  // On a project's list: show every status (even empty) with an inline
  // "New task" row, like Plane.
  project?: ProjectOption
}

export interface TaskGroup {
  key: string
  label: string
  category: StatusCategory
  statusId?: number
  tasks: TaskSummary[]
}

// Plane's list layout: sticky group headers, full-width rows with the
// identifier, title and editable property chips, and inline add per group.
export function TaskList({
  tasks,
  statuses,
  milestones,
  users,
  hideMilestone,
  groupBy = "status",
  project,
}: TaskListProps) {
  const statusOf = (task: TaskSummary) =>
    statuses.find((s) => s.id === task.status_id)

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
          statusId: status.id,
          tasks: tasks.filter((task) => task.status_id === status.id),
        }))

  const visibleGroups = project
    ? groups
    : groups.filter((group) => group.tasks.length > 0)
  // Line titles up by giving identifiers the width of the longest one.
  const idWidth = Math.max(0, ...tasks.map((task) => task.identifier.length))

  return (
    <div className="flex flex-col">
      {visibleGroups.map((group) => (
        <TaskListGroupSection
          key={group.key}
          group={group}
          project={project}
          idWidth={idWidth}
          rowProps={{ statuses, milestones, users, hideMilestone }}
        />
      ))}
    </div>
  )
}
