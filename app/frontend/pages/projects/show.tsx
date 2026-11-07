import { Head, usePage } from "@inertiajs/react"
import { ListTodo } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { ProjectLogo } from "@/components/projects/project-logo"
import { EmptyTasks } from "@/components/tasks/empty-tasks"
import {
  LayoutSwitcher,
  type TaskLayout,
} from "@/components/tasks/layout-switcher"
import { NewTaskDialog } from "@/components/tasks/new-task-dialog"
import { TaskBoard } from "@/components/tasks/task-board"
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
  // The layout lives in the URL (?layout=board) so it renders the same on
  // the server and survives reloads; filters and layout keep each other.
  const query = new URLSearchParams(usePage().url.split("?")[1] ?? "")
  const layout: TaskLayout = query.get("layout") === "board" ? "board" : "list"

  function href({ mode: nextMode = mode, layout: nextLayout = layout } = {}) {
    return projectPath(project.id, {
      mode: nextMode === "all" ? undefined : nextMode,
      layout: nextLayout === "list" ? undefined : nextLayout,
    })
  }

  const modes = [
    { value: "all", label: "All", href: href({ mode: "all" }) },
    { value: "active", label: "Active", href: href({ mode: "active" }) },
    { value: "backlog", label: "Backlog", href: href({ mode: "backlog" }) },
  ]

  return (
    <AppLayout
      header={
        <PageHeader
          breadcrumbs={[
            {
              title: project.name,
              href: projectPath(project.id),
              icon: <ProjectLogo project={project} />,
            },
            { title: "Tasks", icon: <ListTodo /> },
          ]}
          count={tasks.length}
          layoutSwitcher={
            <LayoutSwitcher
              value={layout}
              hrefFor={(next) => href({ layout: next })}
            />
          }
          actions={<NewTaskDialog {...props} />}
          modes={modes}
          mode={mode}
        />
      }
    >
      <Head title={`${project.name} tasks`} />

      <div className="flex flex-1 flex-col">
        {tasks.length === 0 && mode !== "all" ? (
          <EmptyTasks description="Nothing in this view." />
        ) : layout === "board" ? (
          <TaskBoard {...props} />
        ) : (
          <TaskList {...props} project={project} />
        )}
      </div>
    </AppLayout>
  )
}
