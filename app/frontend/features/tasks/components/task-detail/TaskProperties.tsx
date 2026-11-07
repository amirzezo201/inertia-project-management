import { Link } from "@inertiajs/react"
import { Fragment, type ReactNode } from "react"

import { DatePill } from "@/components/common/fields/DatePill"
import { PillSelect } from "@/components/common/fields/PillSelect"
import { cn } from "@/lib/utils"
import { taskPath } from "@/routes"

import type { TaskShowProps } from "../../TaskDetailPage"
import {
  assigneePillOptions,
  milestonePillOptions,
  priorityPillOptions,
  statusPillOptions,
} from "../../utils/taskPillOptions"
import { TaskEstimateField } from "./TaskEstimateField"
import { TaskPropertyGroupHeading } from "./TaskPropertyGroupHeading"
import { TaskPropertyRow } from "./TaskPropertyRow"

type GroupKey = "state" | "people" | "planning" | "relations"

const GROUP_LABELS: Record<GroupKey, string> = {
  state: "State",
  people: "People",
  planning: "Planning",
  relations: "Relations",
}

// The task's Properties: a two-column grid of name and control, split into
// labelled groups. Every control saves on change.
export function TaskProperties({
  task,
  parent,
  statuses,
  milestones,
  users,
  onSave,
  className,
}: TaskShowProps & {
  onSave: (attributes: Record<string, string>) => void
  className?: string
}) {
  const groups: { key: GroupKey; rows: ReactNode[] }[] = [
    {
      key: "state",
      rows: [
        <TaskPropertyRow key="status" label="Status">
          <PillSelect
            variant="property"
            label="Status"
            value={String(task.status_id)}
            options={statusPillOptions(statuses)}
            onChange={(value) => onSave({ status_id: value })}
          />
        </TaskPropertyRow>,
        <TaskPropertyRow key="priority" label="Priority">
          <PillSelect
            variant="property"
            label="Priority"
            value={task.priority}
            options={priorityPillOptions()}
            onChange={(value) => onSave({ priority: value })}
          />
        </TaskPropertyRow>,
      ],
    },
    {
      key: "people",
      rows: [
        <TaskPropertyRow key="assignee" label="Assignee">
          <PillSelect
            variant="property"
            label="Assignee"
            value={String(task.assignee_id ?? "")}
            options={assigneePillOptions(users, "Unassigned")}
            onChange={(value) => onSave({ assignee_id: value })}
          />
        </TaskPropertyRow>,
      ],
    },
    {
      key: "planning",
      rows: [
        <TaskPropertyRow key="milestone" label="Milestone">
          <PillSelect
            variant="property"
            label="Milestone"
            value={String(task.milestone_id ?? "")}
            options={milestonePillOptions(milestones, "No milestone")}
            onChange={(value) => onSave({ milestone_id: value })}
          />
        </TaskPropertyRow>,
        <TaskPropertyRow key="estimate" label="Estimate">
          <TaskEstimateField
            task={task}
            variant="property"
            onSave={(estimation) => onSave({ estimation })}
          />
        </TaskPropertyRow>,
        <TaskPropertyRow key="start" label="Start date">
          <DatePill
            variant="property"
            label="Start date"
            value={task.start_date ?? ""}
            onChange={(value) => onSave({ start_date: value })}
          />
        </TaskPropertyRow>,
        <TaskPropertyRow key="due" label="Due date">
          <DatePill
            variant="property"
            label="Due date"
            value={task.due_date ?? ""}
            onChange={(value) => onSave({ due_date: value })}
          />
        </TaskPropertyRow>,
      ],
    },
    {
      key: "relations",
      rows: parent
        ? [
            <TaskPropertyRow key="parent" label="Parent">
              <Link
                href={taskPath(parent.id)}
                title={parent.title}
                className="flex h-7 max-w-full items-center gap-1.5 rounded-full border px-2.5 text-sm hover:bg-accent"
              >
                <span className="shrink-0 text-muted-foreground text-xs">
                  {parent.identifier}
                </span>
                <span className="truncate">{parent.title}</span>
              </Link>
            </TaskPropertyRow>,
          ]
        : [],
    },
  ]
  const visibleGroups = groups.filter((group) => group.rows.length > 0)

  return (
    <section className={cn("mt-6 border-t pt-5", className)}>
      <h2 className="mb-3 flex h-7 items-center font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Properties
      </h2>
      {/* The name column takes a share of the room, capped at what long names
          need, so a narrow sidebar leaves the controls enough space. */}
      <div className="grid grid-cols-[minmax(0,min(40%,140px))_minmax(0,1fr)] items-start gap-x-2 gap-y-2.5">
        {visibleGroups.map((group, index) => (
          <Fragment key={group.key}>
            <TaskPropertyGroupHeading
              label={GROUP_LABELS[group.key]}
              className={cn(index > 0 && "mt-2")}
            />
            {group.rows}
          </Fragment>
        ))}
      </div>
    </section>
  )
}
