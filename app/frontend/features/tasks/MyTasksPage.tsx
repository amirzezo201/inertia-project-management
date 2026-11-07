import { Head } from "@inertiajs/react"
import { CircleUserRound } from "lucide-react"

import { PageHeader } from "@/components/common/page/PageHeader"
import AppLayout from "@/components/layout/AppLayout"
import { TasksEmptyState } from "@/features/tasks/components/TasksEmptyState"
import { myTasksPath } from "@/routes"
import type { MilestoneOption, Option, Status, TaskSummary } from "@/types"
import { TaskList } from "./components/TaskList"

interface MyTasksProps {
  tasks: TaskSummary[]
  statuses: Status[]
  milestones: MilestoneOption[]
  users: Option[]
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
          breadcrumbs={[{ title: "My tasks", icon: <CircleUserRound /> }]}
          count={tasks.length}
          modes={modes}
          mode={mode}
        />
      }
    >
      <Head title="My tasks" />

      <div className="flex flex-1 flex-col">
        {tasks.length === 0 ? (
          <TasksEmptyState
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
