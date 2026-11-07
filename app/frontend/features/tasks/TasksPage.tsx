import { Head } from "@inertiajs/react"
import { ListTodo } from "lucide-react"

import { PageHeader } from "@/components/common/page/PageHeader"
import AppLayout from "@/components/layout/AppLayout"
import { TasksEmptyState } from "@/features/tasks/components/TasksEmptyState"
import { tasksPath } from "@/routes"
import type { MilestoneOption, Option, Status, TaskSummary } from "@/types"
import { TaskList } from "./components/TaskList"

interface TasksIndexProps {
  tasks: TaskSummary[]
  statuses: Status[]
  milestones: MilestoneOption[]
  users: Option[]
  mode: string
}

// Huly's "All issues": every task across projects.
export default function TasksIndex(props: TasksIndexProps) {
  const { tasks, mode } = props
  const modes = [
    { value: "all", label: "All", href: tasksPath() },
    { value: "active", label: "Active", href: tasksPath({ mode: "active" }) },
    {
      value: "backlog",
      label: "Backlog",
      href: tasksPath({ mode: "backlog" }),
    },
  ]

  return (
    <AppLayout
      header={
        <PageHeader
          breadcrumbs={[{ title: "All tasks", icon: <ListTodo /> }]}
          count={tasks.length}
          modes={modes}
          mode={mode}
        />
      }
    >
      <Head title="All tasks" />

      <div className="flex flex-1 flex-col">
        {tasks.length === 0 ? (
          <TasksEmptyState description="Nothing in this view." />
        ) : (
          <TaskList {...props} groupBy="category" />
        )}
      </div>
    </AppLayout>
  )
}
