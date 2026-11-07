import { Head, router, usePage } from "@inertiajs/react"
import { Copy, Ellipsis, Link2, Trash2 } from "lucide-react"
import { useRef, useState } from "react"

import { DetailHeader } from "@/components/detail-header"
import { DatePill, EstimatePill, PillSelect } from "@/components/property-pills"
import { PropertyRow } from "@/components/property-row"
import { RichTextEditor } from "@/components/rich-text-editor"
import { NewTaskDialog } from "@/components/tasks/new-task-dialog"
import { TaskRow } from "@/components/tasks/task-list"
import {
  assigneePillOptions,
  milestonePillOptions,
  priorityPillOptions,
  statusPillOptions,
} from "@/components/tasks/task-pill-options"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { Separator } from "@/components/ui/separator"
import { toastManager } from "@/components/ui/toast"
import { useClipboard } from "@/hooks/use-clipboard"
import { useInitials } from "@/hooks/use-initials"
import AppLayout from "@/layouts/app-layout"
import { projectPath, taskPath } from "@/routes"
import type { ProjectProps, Task } from "@/types"

interface TaskShowProps extends ProjectProps {
  task: Task
  parent: Task | null
  subtasks: Task[]
}

// Huly's issue view: a document column (title, description, sub-tasks) and a
// properties panel. Everything saves in place; the header shows "Saved".
export default function TaskShow(props: TaskShowProps) {
  const { project, statuses, milestones, users, task, parent, subtasks } = props
  const { errors } = usePage().props
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef<number>(undefined)

  function save(attributes: Record<string, string>) {
    router.patch(taskPath(task.id), attributes, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setSaved(true)
        window.clearTimeout(savedTimer.current)
        savedTimer.current = window.setTimeout(() => setSaved(false), 2000)
      },
    })
  }

  const creator = users.find((user) => user.id === task.creator_id)
  const errorMessages = Object.entries(errors).flatMap(([key, messages]) =>
    [messages].flat().map((message) => `${key.replace(/_/g, " ")} ${message}`),
  )

  const breadcrumbs = [
    { title: project.name, href: projectPath(project.id) },
    ...(parent
      ? [{ title: parent.identifier, href: taskPath(parent.id) }]
      : []),
    { title: task.identifier, href: taskPath(task.id) },
  ]

  return (
    <AppLayout
      header={
        <DetailHeader
          breadcrumbs={breadcrumbs}
          status={saved ? "Saved" : null}
          actions={<TaskActions task={task} />}
        />
      }
    >
      <Head title={`${task.identifier} ${task.title}`} />

      {/* Keyed by task so the uncontrolled title and editor reset between tasks. */}
      <div key={task.id} className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8 lg:px-10">
            <input
              aria-label="Title"
              defaultValue={task.title}
              placeholder="Task title"
              className="w-full rounded-md bg-transparent font-semibold text-2xl outline-none placeholder:text-muted-foreground/72"
              onBlur={(event) => {
                const title = event.target.value.trim()
                if (title === "") event.target.value = task.title
                else if (title !== task.title) save({ title })
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur()
              }}
            />

            <RichTextEditor
              content={task.description}
              onBlur={(html) => {
                if (html !== (task.description ?? ""))
                  save({ description: html })
              }}
            />

            {errorMessages.length > 0 && (
              <p className="text-destructive-foreground text-sm">
                {errorMessages.join(". ")}
              </p>
            )}

            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-medium text-sm">Sub-tasks</h2>
                <span className="text-muted-foreground text-sm">
                  {subtasks.length}
                </span>
                <div className="ms-auto">
                  <NewTaskDialog {...props} parent={task} compact />
                </div>
              </div>

              {subtasks.length > 0 ? (
                <ul className="divide-y rounded-lg border">
                  {subtasks.map((subtask) => {
                    const status = statuses.find(
                      (s) => s.id === subtask.status_id,
                    )
                    return (
                      status && (
                        <TaskRow
                          key={subtask.id}
                          task={subtask}
                          status={status}
                          assignee={users.find(
                            (u) => u.id === subtask.assignee_id,
                          )}
                        />
                      )
                    )
                  })}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No sub-tasks.</p>
              )}
            </section>
          </div>
        </div>

        <aside className="flex shrink-0 flex-col gap-1 overflow-y-auto border-t px-4 py-6 lg:w-80 lg:border-t-0 lg:border-l">
          <PropertyRow label="Status">
            <PillSelect
              variant="ghost"
              label="Status"
              value={String(task.status_id)}
              options={statusPillOptions(statuses)}
              onChange={(value) => save({ status_id: value })}
            />
          </PropertyRow>
          <PropertyRow label="Priority">
            <PillSelect
              variant="ghost"
              label="Priority"
              value={task.priority}
              options={priorityPillOptions()}
              onChange={(value) => save({ priority: value })}
            />
          </PropertyRow>
          <PropertyRow label="Created by">
            <CreatedBy name={creator?.name} />
          </PropertyRow>
          <PropertyRow label="Assignee">
            <PillSelect
              variant="ghost"
              label="Assignee"
              value={String(task.assignee_id ?? "")}
              options={assigneePillOptions(users, "Unassigned")}
              onChange={(value) => save({ assignee_id: value })}
            />
          </PropertyRow>

          <Separator className="my-3" />

          <PropertyRow label="Milestone">
            <PillSelect
              variant="ghost"
              label="Milestone"
              value={String(task.milestone_id ?? "")}
              options={milestonePillOptions(milestones, "No milestone")}
              onChange={(value) => save({ milestone_id: value })}
            />
          </PropertyRow>
          <PropertyRow label="Estimation">
            <EstimateField
              task={task}
              onSave={(estimation) => save({ estimation })}
            />
          </PropertyRow>

          <Separator className="my-3" />

          <PropertyRow label="Start date">
            <DatePill
              variant="ghost"
              label="Start date"
              value={task.start_date ?? ""}
              onChange={(value) => save({ start_date: value })}
            />
          </PropertyRow>
          <PropertyRow label="Due date">
            <DatePill
              variant="ghost"
              label="Due date"
              value={task.due_date ?? ""}
              onChange={(value) => save({ due_date: value })}
            />
          </PropertyRow>
        </aside>
      </div>
    </AppLayout>
  )
}

// Copy link and the "more" menu in the header, like Huly's panel utilities.
function TaskActions({ task }: { task: Task }) {
  const [, copy] = useClipboard()

  async function copyText(text: string, title: string) {
    if (await copy(text)) toastManager.add({ title, type: "success" })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Copy link"
        title="Copy link"
        onClick={() => copyText(window.location.href, "Link copied")}
      >
        <Link2 />
      </Button>
      <Menu>
        <MenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="More actions" />
          }
        >
          <Ellipsis />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuItem
            onClick={() =>
              copyText(task.identifier, `Copied ${task.identifier}`)
            }
          >
            <Copy />
            Copy ID
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            variant="destructive"
            onClick={() => {
              const message =
                task.subtasks_count > 0
                  ? `Delete ${task.identifier} and its ${task.subtasks_count} sub-tasks?`
                  : `Delete ${task.identifier}?`
              if (confirm(message)) router.delete(taskPath(task.id))
            }}
          >
            <Trash2 />
            Delete task
          </MenuItem>
        </MenuPopup>
      </Menu>
    </>
  )
}

function CreatedBy({ name }: { name?: string }) {
  const getInitials = useInitials()

  return (
    <div className="flex h-8 items-center gap-2 px-2 text-sm">
      <Avatar className="size-5">
        <AvatarFallback className="text-[0.625rem]">
          {getInitials(name ?? "?")}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{name ?? "Unknown"}</span>
    </div>
  )
}

// Saves when the estimate popover closes, not on every keystroke.
function EstimateField({
  task,
  onSave,
}: {
  task: Task
  onSave: (value: string) => void
}) {
  const [value, setValue] = useState(
    task.estimation ? String(task.estimation) : "",
  )

  return (
    <EstimatePill
      variant="ghost"
      value={value}
      onChange={setValue}
      onClose={() => {
        if (Number(value) !== task.estimation) onSave(value || "0")
      }}
    />
  )
}
