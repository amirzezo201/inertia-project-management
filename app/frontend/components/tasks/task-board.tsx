import { Link } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { useState } from "react"

import { StatusIcon } from "@/components/tasks/status-icon"
import { QuickAdd, TaskProperties } from "@/components/tasks/task-list"
import { Button } from "@/components/ui/button"
import { taskPath } from "@/routes"
import type { Milestone, Project, Status, Task, UserSummary } from "@/types"

interface TaskBoardProps {
  project: Project
  tasks: Task[]
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
}

// Plane's board (Kanban): a column per status with cards. A card's status
// changes from its Status chip.
export function TaskBoard({
  project,
  tasks,
  statuses,
  milestones,
  users,
}: TaskBoardProps) {
  return (
    <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
      {statuses.map((status) => (
        <BoardColumn
          key={status.id}
          project={project}
          status={status}
          tasks={tasks.filter((task) => task.status_id === status.id)}
          statuses={statuses}
          milestones={milestones}
          users={users}
        />
      ))}
    </div>
  )
}

function BoardColumn({
  project,
  status,
  tasks,
  statuses,
  milestones,
  users,
}: TaskBoardProps & { status: Status }) {
  const [adding, setAdding] = useState(false)

  return (
    <section
      aria-label={status.name}
      className="flex w-[336px] shrink-0 flex-col rounded-lg bg-muted/56 p-2"
    >
      <header className="flex items-center gap-1 px-1 py-1.5">
        <span className="flex size-5 items-center justify-center">
          <StatusIcon category={status.category} />
        </span>
        <h2 className="truncate font-medium text-sm">{status.name}</h2>
        <span className="ps-2 font-medium text-muted-foreground text-xs">
          {tasks.length}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          className="ms-auto"
          aria-label={`New task in ${status.name}`}
          title={`New task in ${status.name}`}
          onClick={() => setAdding(true)}
        >
          <Plus />
        </Button>
      </header>

      <ul className="flex min-h-[120px] flex-col gap-2 pt-2">
        {tasks.map((task) => (
          <BoardCard
            key={task.id}
            task={task}
            statuses={statuses}
            milestones={milestones}
            users={users}
          />
        ))}
      </ul>

      <div className="pt-2">
        <QuickAdd
          project={project}
          statusId={status.id}
          open={adding}
          onOpenChange={setAdding}
          compact
        />
      </div>
    </section>
  )
}

function BoardCard({
  task,
  statuses,
  milestones,
  users,
}: {
  task: Task
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
}) {
  return (
    <li className="relative flex flex-col gap-3 rounded-lg border bg-card p-3 text-xs shadow-xs/5 transition-[border-color,box-shadow] hover:border-ring/40 hover:shadow-md/5">
      <span className="font-medium text-muted-foreground">
        {task.identifier}
      </span>
      {/* The title link covers the card; chips sit above it. */}
      <Link
        href={taskPath(task.id)}
        prefetch
        className="break-words font-medium text-sm after:absolute after:inset-0"
      >
        {task.title}
      </Link>
      <TaskProperties
        task={task}
        statuses={statuses}
        milestones={milestones}
        users={users}
        wrap
      />
    </li>
  )
}
