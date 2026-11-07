import { Head } from "@inertiajs/react"
import { ListTodo } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { EmptyTasks } from "@/components/tasks/empty-tasks"
import { NewTaskDialog } from "@/components/tasks/new-task-dialog"
import { TaskList } from "@/components/tasks/task-list"
import AppLayout from "@/layouts/app-layout"
import { projectPath } from "@/routes"
import type { ProjectProps, Task } from "@/types"

interface ProjectShowProps extends ProjectProps {
  tasks: Task[]
  mode: string
}

export default function ProjectShow(props: ProjectShowProps) {
  const { project, tasks, mode } = props
  const modes = [
    { value: "all", label: "All", href: projectPath(project.id) },
    {
      value: "active",
      label: "Active",
      href: projectPath(project.id, { mode: "active" }),
    },
    {
      value: "backlog",
      label: "Backlog",
      href: projectPath(project.id, { mode: "backlog" }),
    },
  ]

  return (
    <AppLayout
      header={
        <PageHeader
          icon={<ListTodo />}
          title={
            <>
              {project.name}{" "}
              <span className="font-normal text-muted-foreground">· Tasks</span>
            </>
          }
          actions={<NewTaskDialog {...props} />}
          modes={modes}
          mode={mode}
        />
      }
    >
      <Head title={`${project.name} tasks`} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {tasks.length === 0 ? (
          <EmptyTasks
            description={
              mode === "all"
                ? `Create the first task for ${project.name}.`
                : "Nothing in this view."
            }
          />
        ) : (
          <TaskList {...props} />
        )}
      </div>
    </AppLayout>
  )
}
