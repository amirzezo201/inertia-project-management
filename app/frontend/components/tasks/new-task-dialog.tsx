import { useForm } from "@inertiajs/react"
import { CornerDownRight, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"

import { DatePill, EstimatePill, PillSelect } from "@/components/property-pills"
import { RichTextEditor } from "@/components/rich-text-editor"
import {
  assigneePillOptions,
  milestonePillOptions,
  priorityPillOptions,
  statusPillOptions,
} from "@/components/tasks/task-pill-options"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogFooter,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getItem, removeItem, setItem } from "@/lib/storage"
import { projectTasksPath } from "@/routes"
import type { ProjectProps, Task } from "@/types"

type SubtaskDraft = { title: string }

type TaskForm = {
  title: string
  description: string
  status_id: string
  priority: string
  assignee_id: string
  milestone_id: string
  due_date: string
  estimation: string
  subtasks: SubtaskDraft[]
}

interface NewTaskDialogProps extends ProjectProps {
  parent?: Task
  milestoneId?: number
  // Icon-only "+" trigger, for section headers like Huly's sub-issues list.
  compact?: boolean
}

const CLOSE_MESSAGE =
  "Do you want to close this dialog? All changes will be lost."

// Huly's "New issue" card: project in the header, a large title, a rich-text
// description, inline sub-tasks, and a row of property buttons. Unsaved input
// is kept as a draft in localStorage, so the button offers "Resume draft".
export function NewTaskDialog({
  project,
  statuses,
  milestones,
  users,
  parent,
  milestoneId,
  compact,
}: NewTaskDialogProps) {
  const draftKey = `runwell:task-draft:${project.id}:${parent?.id ?? "root"}`

  const blank = (): TaskForm => ({
    title: "",
    description: "",
    status_id: String(project.default_status_id ?? statuses[0]?.id ?? ""),
    priority: "no_priority",
    assignee_id: String(project.default_assignee_id ?? ""),
    milestone_id: String(milestoneId ?? parent?.milestone_id ?? ""),
    due_date: "",
    estimation: "",
    subtasks: [],
  })

  const form = useForm<TaskForm>(blank())
  const [open, setOpen] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  // Bumped to remount the editor when its content is replaced (draft/reset).
  const [editorKey, setEditorKey] = useState(0)

  const hasContent =
    form.data.title.trim() !== "" ||
    form.data.description.replace(/<[^>]*>/g, "").trim() !== "" ||
    form.data.subtasks.some((subtask) => subtask.title.trim() !== "")

  useEffect(() => setHasDraft(getItem(draftKey) !== null), [draftKey])

  useEffect(() => {
    if (!open) return
    if (hasContent) setItem(draftKey, JSON.stringify(form.data))
    else removeItem(draftKey)
  }, [open, hasContent, form.data, draftKey])

  function openDialog() {
    const draft = getItem(draftKey)
    form.setData(draft ? { ...blank(), ...JSON.parse(draft) } : blank())
    setEditorKey((key) => key + 1)
    setOpen(true)
  }

  function discard() {
    removeItem(draftKey)
    setHasDraft(false)
    form.clearErrors()
    setOpen(false)
  }

  function requestClose() {
    if (!hasContent || confirm(CLOSE_MESSAGE)) discard()
  }

  function submit() {
    if (form.data.title.trim() === "" || form.processing) return

    form.transform(({ subtasks, ...data }) => ({
      ...data,
      parent_id: parent?.id ?? "",
      subtasks_attributes: subtasks
        .filter((subtask) => subtask.title.trim() !== "")
        .map((subtask) => ({
          title: subtask.title,
          milestone_id: data.milestone_id,
        })),
    }))
    form.post(projectTasksPath(project.id), {
      preserveScroll: true,
      onSuccess: discard,
    })
  }

  function updateSubtask(index: number, title: string) {
    form.setData(
      "subtasks",
      form.data.subtasks.map((subtask, i) =>
        i === index ? { title } : subtask,
      ),
    )
  }

  const triggerLabel = hasDraft
    ? "Resume draft"
    : parent
      ? "Add sub-task"
      : "New task"

  const errors = form.errors as Record<string, string | string[] | undefined>
  const errorMessages = Object.entries(errors)
    .filter(([key]) => key !== "title")
    .flatMap(([key, messages]) =>
      [messages]
        .flat()
        .map((message) => `${key.replace(/_/g, " ")} ${message}`),
    )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? openDialog() : requestClose())}
    >
      {compact ? (
        <DialogTrigger
          render={<Button size="icon-sm" variant="ghost" />}
          aria-label={triggerLabel}
          title={triggerLabel}
        >
          <Plus />
        </DialogTrigger>
      ) : (
        <DialogTrigger
          render={<Button size="sm" variant={parent ? "outline" : "default"} />}
        >
          <Plus />
          {triggerLabel}
        </DialogTrigger>
      )}

      <DialogPopup
        className="max-w-2xl"
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            submit()
          }
        }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="flex min-h-0 flex-col"
        >
          <header className="flex items-center gap-2 px-6 pe-12 pt-5">
            <Badge variant="outline" className="font-mono">
              {project.identifier}
            </Badge>
            <span className="text-muted-foreground text-sm">›</span>
            <DialogTitle className="font-medium text-sm">
              {parent ? "New sub-task" : "New task"}
            </DialogTitle>
          </header>

          {parent && (
            <p className="flex items-center gap-1.5 px-6 pt-2 text-muted-foreground text-sm">
              <CornerDownRight className="size-4" />
              Sub-task of {parent.identifier} {parent.title}
            </p>
          )}

          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-6 py-4">
            <input
              aria-label="Task title"
              value={form.data.title}
              onChange={(event) => form.setData("title", event.target.value)}
              placeholder="Task title"
              autoFocus
              className="w-full bg-transparent font-semibold text-lg outline-none placeholder:text-muted-foreground/72"
            />
            {errors.title && (
              <p className="text-destructive-foreground text-sm">
                Title {[errors.title].flat().join(" ")}
              </p>
            )}

            <RichTextEditor
              key={editorKey}
              content={form.data.description}
              placeholder="Add description…"
              onChange={(html) => form.setData("description", html)}
            />

            {!parent && (
              <section className="mt-2 flex flex-col gap-1 border-t pt-3">
                {form.data.subtasks.map((subtask, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id until saved
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <CornerDownRight className="size-4 shrink-0 text-muted-foreground" />
                    <input
                      aria-label={`Sub-task ${index + 1} title`}
                      value={subtask.title}
                      autoFocus={index === form.data.subtasks.length - 1}
                      onChange={(event) =>
                        updateSubtask(index, event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.metaKey &&
                          !event.ctrlKey
                        ) {
                          event.preventDefault()
                          form.setData("subtasks", [
                            ...form.data.subtasks,
                            { title: "" },
                          ])
                        }
                      }}
                      placeholder="Sub-task title"
                      className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/72"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Remove sub-task"
                      onClick={() =>
                        form.setData(
                          "subtasks",
                          form.data.subtasks.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <X />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start text-muted-foreground"
                  onClick={() =>
                    form.setData("subtasks", [
                      ...form.data.subtasks,
                      { title: "" },
                    ])
                  }
                >
                  <Plus />
                  Add sub-task
                </Button>
              </section>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 px-6 pb-4">
            <PillSelect
              label="Status"
              value={form.data.status_id}
              options={statusPillOptions(statuses)}
              onChange={(value) => form.setData("status_id", value)}
            />
            <PillSelect
              label="Priority"
              value={form.data.priority}
              options={priorityPillOptions()}
              onChange={(value) => form.setData("priority", value)}
            />
            <PillSelect
              label="Assignee"
              value={form.data.assignee_id}
              options={assigneePillOptions(users)}
              onChange={(value) => form.setData("assignee_id", value)}
            />
            <EstimatePill
              value={form.data.estimation}
              onChange={(value) => form.setData("estimation", value)}
            />
            <PillSelect
              label="Milestone"
              value={form.data.milestone_id}
              options={milestonePillOptions(milestones)}
              onChange={(value) => form.setData("milestone_id", value)}
            />
            <DatePill
              label="Due date"
              value={form.data.due_date}
              onChange={(value) => form.setData("due_date", value)}
            />
          </div>

          {errorMessages.length > 0 && (
            <p className="px-6 pb-3 text-destructive-foreground text-sm">
              {errorMessages.join(". ")}
            </p>
          )}

          <DialogFooter>
            <span className="me-auto hidden text-muted-foreground text-xs sm:block">
              ⌘↵ to create
            </span>
            <Button type="button" variant="ghost" onClick={requestClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.processing}
              disabled={form.data.title.trim() === ""}
            >
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
