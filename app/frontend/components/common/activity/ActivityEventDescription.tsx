import { Link } from "@inertiajs/react"
import { taskPath } from "@/routes"
import type { ActivityEvent, TaskPriority } from "@/types"
import { formatDate, priorityLabels } from "@/utils/tasks"

import { ActivityValue } from "./ActivityValue"

const attributeLabels: Record<string, string> = {
  status: "status",
  priority: "priority",
  start_date: "start date",
  due_date: "due date",
  estimation: "estimation",
}

function formatValue(attribute: string, value: string | number | null) {
  if (value === null || value === "") return null
  if (attribute === "priority")
    return priorityLabels[value as TaskPriority] ?? String(value)
  if (attribute === "start_date" || attribute === "due_date")
    return formatDate(String(value))
  if (attribute === "estimation")
    return Number(value) ? `${Number(value)}h` : null
  return String(value)
}

// Plane's phrasing: "set the status to Done.", "added a new assignee Ann".
export function ActivityEventDescription({ event }: { event: ActivityEvent }) {
  const { particulars } = event

  switch (event.action) {
    case "task_created":
      return <>created the task.</>
    case "task_subtask_added":
      return (
        <>
          added the sub-task{" "}
          <Link
            href={taskPath(Number(particulars.subtask_id))}
            className="font-medium text-foreground hover:underline"
          >
            {particulars.identifier} {particulars.title}
          </Link>
          .
        </>
      )
    case "task_updated": {
      const attribute = String(particulars.attribute)
      const from = formatValue(attribute, particulars.from)
      const to = formatValue(attribute, particulars.to)

      switch (attribute) {
        case "title":
          return (
            <>
              set the name to <ActivityValue>{to}</ActivityValue>.
            </>
          )
        case "description":
          return <>updated the description.</>
        case "assignee":
          return to ? (
            <>
              added a new assignee <ActivityValue>{to}</ActivityValue>.
            </>
          ) : (
            <>
              removed the assignee <ActivityValue>{from}</ActivityValue>.
            </>
          )
        case "milestone":
          return to ? (
            <>
              added this task to the milestone{" "}
              <ActivityValue>{to}</ActivityValue>.
            </>
          ) : (
            <>
              removed this task from the milestone{" "}
              <ActivityValue>{from}</ActivityValue>.
            </>
          )
        default: {
          const label =
            attributeLabels[attribute] ?? attribute.replace(/_/g, " ")
          return to ? (
            <>
              set the {label} to <ActivityValue>{to}</ActivityValue>.
            </>
          ) : (
            <>removed the {label}.</>
          )
        }
      }
    }
    default:
      return <>updated the task.</>
  }
}
