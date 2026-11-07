import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { ProjectOption } from "@/types"

import type { TaskGroup } from "./TaskList"
import { TaskQuickAdd } from "./TaskQuickAdd"
import { TaskRow, type TaskRowProps } from "./TaskRow"
import { TaskStatusIcon } from "./TaskStatusIcon"

export function TaskListGroupSection({
  group,
  project,
  idWidth,
  rowProps,
}: {
  group: TaskGroup
  project?: ProjectOption
  idWidth: number
  rowProps: Omit<TaskRowProps, "task" | "idWidth">
}) {
  const [adding, setAdding] = useState(false)
  const canAdd = project !== undefined && group.statusId !== undefined

  return (
    <section>
      <div className="sticky top-0 z-[2] flex items-center gap-2 border-b bg-muted/72 px-5 py-1.5 backdrop-blur">
        <TaskStatusIcon category={group.category} />
        <h2 className="truncate font-medium text-sm">{group.label}</h2>
        <span className="ps-1 font-medium text-muted-foreground text-xs">
          {group.tasks.length}
        </span>
        {canAdd && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="ms-auto"
            aria-label={`New task in ${group.label}`}
            title={`New task in ${group.label}`}
            onClick={() => setAdding(true)}
          >
            <Plus />
          </Button>
        )}
      </div>

      <ul>
        {group.tasks.map((task) => (
          <TaskRow key={task.id} task={task} idWidth={idWidth} {...rowProps} />
        ))}
      </ul>

      {canAdd && (
        <TaskQuickAdd
          project={project}
          statusId={group.statusId as number}
          open={adding}
          onOpenChange={setAdding}
        />
      )}
    </section>
  )
}
