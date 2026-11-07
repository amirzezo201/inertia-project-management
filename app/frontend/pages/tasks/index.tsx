import { Head } from "@inertiajs/react"
import { ListTodo } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { EmptyTasks } from "@/components/tasks/empty-tasks"
import { TaskList } from "@/components/tasks/task-list"
import AppLayout from "@/layouts/app-layout"
import { tasksPath } from "@/routes"
import type { Milestone, Status, Task, UserSummary } from "@/types"

interface TasksIndexProps {
  tasks: Task[]
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
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
          <EmptyTasks description="Nothing in this view." />
        ) : (
          <TaskList {...props} groupBy="category" />
        )}
      </div>
    </AppLayout>
  )
}
