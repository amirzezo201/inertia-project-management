import { Head } from "@inertiajs/react"
import { CircleUserRound } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { EmptyTasks } from "@/components/tasks/empty-tasks"
import { TaskList } from "@/components/tasks/task-list"
import AppLayout from "@/layouts/app-layout"
import { myTasksPath } from "@/routes"
import type { Milestone, Status, Task, UserSummary } from "@/types"

interface MyTasksProps {
  tasks: Task[]
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
  mode: string
}

// Huly's "My issues": what's assigned to me, or what I created.
export default function MyTasks(props: MyTasksProps) {
  const { tasks, mode } = props
  const modes = [
    { value: "assigned", label: "Assigned", href: myTasksPath() },
    {
      value: "created",
      label: "Created",
      href: myTasksPath({ mode: "created" }),
    },
  ]

  return (
    <AppLayout
      header={
        <PageHeader
          icon={<CircleUserRound />}
          title="My tasks"
          modes={modes}
          mode={mode}
        />
      }
    >
      <Head title="My tasks" />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {tasks.length === 0 ? (
          <EmptyTasks
            description={
              mode === "assigned"
                ? "Nothing is assigned to you."
                : "You haven't created any tasks."
            }
          />
        ) : (
          <TaskList {...props} groupBy="category" />
        )}
      </div>
    </AppLayout>
  )
}
