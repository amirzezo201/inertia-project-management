import { useState } from "react"

import type { TaskShowProps } from "../../TaskDetailPage"
import { NewTaskDialog } from "../NewTaskDialog"
import { TaskRow } from "../TaskRow"
import { TaskSectionHeading } from "./TaskSectionHeading"

// The Sub-tasks section: a collapsible heading counting the done ones, an add
// button, then the sub-tasks as list rows. With none, the heading row and its
// + button are all there is.
export function TaskSubtasksSection(props: TaskShowProps) {
  const { task, statuses, milestones, users, subtasks } = props
  const [open, setOpen] = useState(true)
  const done = subtasks.filter((subtask) => {
    const category = statuses.find((s) => s.id === subtask.status_id)?.category
    return category === "completed" || category === "canceled"
  }).length

  return (
    // Collapsed, the heading row is all there is, so the section pulls itself
    // up against the one below it.
    <section className={`mt-6 border-t pt-5 ${open ? "" : "-mb-2"}`}>
      <div className="flex h-7 items-center justify-between">
        <TaskSectionHeading
          label="Sub-tasks"
          tally={subtasks.length > 0 ? `${done}/${subtasks.length}` : undefined}
          open={open}
          onToggle={() => setOpen(!open)}
        />
        {/* Sub-tasks are one level deep, so a sub-task gets no add button. */}
        {open && !task.parent_id && (
          <NewTaskDialog {...props} parent={task} trigger="icon" />
        )}
      </div>

      {open && subtasks.length > 0 && (
        <ul className="mt-3 overflow-hidden rounded-lg border">
          {subtasks.map((subtask) => (
            <TaskRow
              key={subtask.id}
              task={subtask}
              statuses={statuses}
              milestones={milestones}
              users={users}
              hideMilestone
            />
          ))}
        </ul>
      )}
    </section>
  )
}
