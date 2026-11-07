import { Head, router, usePage } from "@inertiajs/react"
import { ListTodo } from "lucide-react"
import { useRef, useState } from "react"

import { ActivitySection } from "@/components/common/activity/ActivitySection"
import { ProjectLogo } from "@/components/common/ProjectLogo"
import { PageHeader } from "@/components/common/page/PageHeader"
import AppLayout from "@/components/layout/AppLayout"
import { projectPath, taskCommentsPath, taskPath } from "@/routes"
import type { ActivityEvent, ProjectProps, Task, TaskSummary } from "@/types"

import { TaskActions } from "./components/task-detail/TaskActions"
import { TaskDescriptionField } from "./components/task-detail/TaskDescriptionField"
import { TaskProperties } from "./components/task-detail/TaskProperties"
import { TaskSubtasksSection } from "./components/task-detail/TaskSubtasksSection"
import { TaskTimestamps } from "./components/task-detail/TaskTimestamps"
import { TaskTitleField } from "./components/task-detail/TaskTitleField"

export interface TaskShowProps extends ProjectProps {
  task: Task
  parent: TaskSummary | null
  subtasks: TaskSummary[]
  activity: ActivityEvent[]
}

export type SaveState = "idle" | "saving" | "saved"

// The full-page task view, itsaplan's layout: the written content (title,
// description, sub-tasks, activity) in a column at the start edge, and the
// actions with the Properties in a sticky sidebar at the end edge. Below xl
// there is no room for two columns, so the actions sit above the title and the
// Properties under the description. Everything saves in place.
export default function TaskShow(props: TaskShowProps) {
  const { project, users, task, activity } = props
  const { errors } = usePage().props
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const savedTimer = useRef<number>(undefined)

  function save(attributes: Record<string, string>) {
    router.patch(taskPath(task.id), attributes, {
      preserveScroll: true,
      preserveState: true,
      onStart: () => setSaveState("saving"),
      onSuccess: () => {
        setSaveState("saved")
        window.clearTimeout(savedTimer.current)
        savedTimer.current = window.setTimeout(() => setSaveState("idle"), 2000)
      },
      onError: () => setSaveState("idle"),
    })
  }

  const errorMessages = Object.entries(errors).flatMap(([key, messages]) =>
    [messages].flat().map((message) => `${key.replace(/_/g, " ")} ${message}`),
  )

  const actions = <TaskActions task={task} saveState={saveState} />

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
            {
              title: "Tasks",
              href: projectPath(project.id),
              icon: <ListTodo />,
            },
            { title: task.identifier },
          ]}
        />
      }
    >
      <Head title={`${task.identifier} ${task.title}`} />

      {/* Keyed by task so uncontrolled fields reset when moving between tasks. */}
      <div key={task.id} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-between gap-10 px-8 py-6 xl:px-12">
          <div className="min-w-0 max-w-3xl flex-1 pb-10">
            <div className="sticky top-0 z-10 -mt-6 bg-background/85 pt-6 pb-3 backdrop-blur-md xl:hidden">
              {actions}
            </div>

            <TaskTitleField task={task} onSave={(title) => save({ title })} />

            <div className="mt-4">
              <TaskDescriptionField
                task={task}
                users={users}
                onSave={(description) => save({ description })}
              />
            </div>

            {errorMessages.length > 0 && (
              <p className="mt-2 text-destructive-foreground text-sm">
                {errorMessages.join(". ")}
              </p>
            )}

            <div className="xl:hidden">
              <TaskProperties {...props} onSave={save} />
            </div>

            <TaskSubtasksSection {...props} />

            <section className="mt-6 border-t pt-5">
              <ActivitySection
                activity={activity}
                users={users}
                commentsPath={taskCommentsPath(task.id)}
              />
            </section>
          </div>

          <aside className="hidden w-80 shrink-0 xl:block">
            <div className="sticky top-6">
              {actions}
              <TaskProperties {...props} onSave={save} className="mt-3 pt-4" />
              <TaskTimestamps task={task} users={users} />
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
