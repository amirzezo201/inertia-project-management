import { Head, usePage } from "@inertiajs/react"
import { ListTodo } from "lucide-react"
import { ProjectLogo } from "@/components/common/ProjectLogo"
import { PageHeader } from "@/components/common/page/PageHeader"
import AppLayout from "@/components/layout/AppLayout"
import { TaskBoard } from "@/features/tasks/components/board/TaskBoard"
import { NewTaskDialog } from "@/features/tasks/components/NewTaskDialog"
import {
  type TaskLayout,
  TaskLayoutSwitcher,
} from "@/features/tasks/components/TaskLayoutSwitcher"
import { TaskList } from "@/features/tasks/components/TaskList"
import { TasksEmptyState } from "@/features/tasks/components/TasksEmptyState"
import { projectPath } from "@/routes"
import type { ProjectProps, TaskSummary } from "@/types"

interface ProjectShowProps extends ProjectProps {
  tasks: TaskSummary[]
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
            <TaskLayoutSwitcher
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
          <TasksEmptyState description="Nothing in this view." />
        ) : layout === "board" ? (
          <TaskBoard {...props} />
        ) : (
          <TaskList {...props} project={project} />
        )}
      </div>
    </AppLayout>
  )
}
