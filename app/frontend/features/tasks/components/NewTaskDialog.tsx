import { router, useForm, usePage } from "@inertiajs/react"
import { CornerLeftUp, Plus, SquarePen } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { RichTextEditor } from "@/components/common/editor/RichTextEditor"
import { DatePill } from "@/components/common/fields/DatePill"
import { EstimatePill } from "@/components/common/fields/EstimatePill"
import { PillSelect } from "@/components/common/fields/PillSelect"
import { ProjectLogo } from "@/components/common/ProjectLogo"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogFooter,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  assigneePillOptions,
  milestonePillOptions,
  priorityPillOptions,
  statusPillOptions,
} from "@/features/tasks/utils/taskPillOptions"
import { projectTasksPath } from "@/routes"
import type {
  MilestoneOption,
  Option,
  ProjectOption,
  Status,
  TaskFormOptions,
  TaskSummary,
} from "@/types"
import { getItem, removeItem, setItem } from "@/utils/storage"

type TaskForm = {
  project_id: string
  title: string
  description: string
  status_id: string
  priority: string
  assignee_id: string
  start_date: string
  due_date: string
  milestone_id: string
  estimation: string
}

interface NewTaskDialogProps {
  // Preselected project; the dialog can switch to any other.
  project?: ProjectOption
  // Lookups the page already has (used until every project's are loaded).
  statuses?: Status[]
  milestones?: MilestoneOption[]
  users?: Option[]
  parent?: TaskSummary
  milestoneId?: number
  // How the opening button looks: a normal button, an icon-only "+", a quiet
  // text button (task page toolbar) or the sidebar's full-width button.
  trigger?: "button" | "icon" | "ghost" | "sidebar"
}

// Plane's "Create new work item" modal: project picker, a big title, a
// description box, a row of property chips, and a footer with "Create more",
// Discard and Save. Closing with unsaved input offers to keep it as a draft.
export function NewTaskDialog({
  project,
  statuses: pageStatuses = [],
  milestones: pageMilestones = [],
  users: pageUsers = [],
  parent,
  milestoneId,
  trigger = "button",
}: NewTaskDialogProps) {
  const { sidebar_projects, task_form } = usePage().props
  const projects = sidebar_projects ?? []
  const draftKey = `runwell:task-draft:${parent?.id ?? "new"}`

  // `task_form` is an optional prop: it's present only right after the
  // dialog's partial reload, and later visits drop it. Keep the last copy.
  const [loadedOptions, setLoadedOptions] = useState<
    TaskFormOptions | undefined
  >(task_form)
  useEffect(() => {
    if (task_form) setLoadedOptions(task_form)
  }, [task_form])

  const statuses = loadedOptions?.statuses ?? pageStatuses
  const milestones = loadedOptions?.milestones ?? pageMilestones
  const users = loadedOptions?.users ?? pageUsers

  function defaultsFor(projectId: string): Partial<TaskForm> {
    const selected = projects.find((p) => String(p.id) === projectId)
    return {
      status_id: String(selected?.default_status_id ?? ""),
      assignee_id: String(selected?.default_assignee_id ?? ""),
      milestone_id: "",
    }
  }

  function blank(): TaskForm {
    const projectId = String(
      parent?.project_id ?? project?.id ?? projects[0]?.id ?? "",
    )
    return {
      project_id: projectId,
      title: "",
      description: "",
      status_id: "",
      priority: "no_priority",
      assignee_id: "",
      start_date: "",
      due_date: "",
      milestone_id: "",
      estimation: "",
      ...defaultsFor(projectId),
      ...(milestoneId || parent?.milestone_id
        ? { milestone_id: String(milestoneId ?? parent?.milestone_id) }
        : {}),
    }
  }

  const form = useForm<TaskForm>(blank())
  const [open, setOpen] = useState(false)
  const [confirmingClose, setConfirmingClose] = useState(false)
  const [createMore, setCreateMore] = useState(false)
  // Bumped to remount the editor when its content is replaced.
  const [editorKey, setEditorKey] = useState(0)
  const titleRef = useRef<HTMLInputElement>(null)

  const projectStatuses = statuses.filter(
    (s) => String(s.project_id) === form.data.project_id,
  )
  const projectMilestones = milestones.filter(
    (m) => String(m.project_id) === form.data.project_id,
  )
  const hasContent =
    form.data.title.trim() !== "" ||
    form.data.description.replace(/<[^>]*>/g, "").trim() !== ""

  // Keep unsaved input in localStorage while the dialog is open.
  useEffect(() => {
    if (!open) return
    if (hasContent) setItem(draftKey, JSON.stringify(form.data))
    else removeItem(draftKey)
  }, [open, hasContent, form.data, draftKey])

  function openDialog() {
    const draft = getItem(draftKey)
    form.setData(draft ? { ...blank(), ...JSON.parse(draft) } : blank())
    form.clearErrors()
    setEditorKey((key) => key + 1)
    setOpen(true)
    // Load (or refresh) every project's statuses and milestones for the picker.
    router.reload({ only: ["task_form"] })
  }

  function close({ keepDraft }: { keepDraft: boolean }) {
    if (!keepDraft) removeItem(draftKey)
    setConfirmingClose(false)
    setOpen(false)
  }

  function requestClose() {
    if (hasContent) setConfirmingClose(true)
    else close({ keepDraft: false })
  }

  function submit() {
    if (form.data.title.trim() === "" || form.processing) return

    form.transform(({ project_id: _projectId, ...data }) => ({
      ...data,
      parent_id: parent?.id ?? "",
    }))
    form.post(projectTasksPath(Number(form.data.project_id)), {
      preserveScroll: true,
      onSuccess: () => {
        removeItem(draftKey)
        if (createMore) {
          form.setData((data) => ({ ...data, title: "", description: "" }))
          setEditorKey((key) => key + 1)
          titleRef.current?.focus()
        } else {
          setOpen(false)
        }
      },
    })
  }

  const label = parent ? "Add sub-task" : "New task"
  const errors = form.errors as Record<string, string | string[] | undefined>
  const errorMessages = Object.entries(errors)
    .filter(([key]) => key !== "title")
    .flatMap(([key, messages]) =>
      [messages]
        .flat()
        .map((message) => `${key.replace(/_/g, " ")} ${message}`),
    )

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => (next ? openDialog() : requestClose())}
      >
        {trigger === "icon" && (
          <DialogTrigger
            render={<Button size="icon-sm" variant="ghost" />}
            aria-label={label}
            title={label}
          >
            <Plus />
          </DialogTrigger>
        )}
        {trigger === "sidebar" && (
          <DialogTrigger
            render={
              <Button variant="outline" className="w-full justify-start" />
            }
            disabled={projects.length === 0}
          >
            <SquarePen />
            New task
          </DialogTrigger>
        )}
        {(trigger === "button" || trigger === "ghost") && (
          <DialogTrigger
            render={
              <Button
                size={trigger === "ghost" ? "xs" : "sm"}
                variant={
                  trigger === "ghost" ? "ghost" : parent ? "outline" : "default"
                }
              />
            }
          >
            <Plus />
            {label}
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
            <header className="flex flex-wrap items-center gap-2 px-6 pe-12 pt-5">
              <DialogTitle className="font-semibold text-base">
                {parent ? "Create new sub-task" : "Create new task"}
              </DialogTitle>
              <PillSelect
                variant="chip"
                label="Project"
                value={form.data.project_id}
                options={projects.map((p) => ({
                  value: String(p.id),
                  label: p.name,
                  icon: <ProjectLogo project={p} />,
                }))}
                onChange={(value) =>
                  form.setData((data) => ({
                    ...data,
                    project_id: value,
                    ...defaultsFor(value),
                  }))
                }
              />
              {parent && (
                <Badge variant="outline" className="gap-1">
                  <CornerLeftUp />
                  {parent.identifier}
                </Badge>
              )}
            </header>

            <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-6 py-4">
              <div>
                <input
                  ref={titleRef}
                  aria-label="Title"
                  value={form.data.title}
                  onChange={(event) =>
                    form.setData("title", event.target.value)
                  }
                  placeholder="Title"
                  maxLength={255}
                  autoFocus
                  className="w-full bg-transparent font-medium text-xl outline-none placeholder:text-muted-foreground/72"
                />
                {errors.title && (
                  <p className="mt-1 text-destructive-foreground text-xs">
                    Title {[errors.title].flat().join(" ")}
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-muted/24 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                <RichTextEditor
                  key={editorKey}
                  content={form.data.description}
                  placeholder="Click to add description"
                  editorClassName="min-h-[120px] p-3"
                  slashCommands
                  mentions={users}
                  onChange={(html) => form.setData("description", html)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 px-6 pb-4">
              <PillSelect
                variant="chip"
                label="Status"
                value={form.data.status_id}
                options={statusPillOptions(projectStatuses)}
                onChange={(value) => form.setData("status_id", value)}
              />
              <PillSelect
                variant="chip"
                label="Priority"
                value={form.data.priority}
                options={priorityPillOptions()}
                onChange={(value) => form.setData("priority", value)}
              />
              <PillSelect
                variant="chip"
                label="Assignee"
                value={form.data.assignee_id}
                options={assigneePillOptions(users)}
                onChange={(value) => form.setData("assignee_id", value)}
              />
              <DatePill
                variant="chip"
                label="Start date"
                value={form.data.start_date}
                onChange={(value) => form.setData("start_date", value)}
              />
              <DatePill
                variant="chip"
                label="Due date"
                value={form.data.due_date}
                onChange={(value) => form.setData("due_date", value)}
              />
              <PillSelect
                variant="chip"
                label="Milestone"
                value={form.data.milestone_id}
                options={milestonePillOptions(projectMilestones)}
                onChange={(value) => form.setData("milestone_id", value)}
              />
              <EstimatePill
                variant="chip"
                value={form.data.estimation}
                onChange={(value) => form.setData("estimation", value)}
              />
            </div>

            {errorMessages.length > 0 && (
              <p className="px-6 pb-3 text-destructive-foreground text-sm">
                {errorMessages.join(". ")}
              </p>
            )}

            <DialogFooter>
              <div className="me-auto flex items-center gap-2 text-muted-foreground text-xs">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                />
                <label htmlFor="create-more">Create more</label>
              </div>
              <Button type="button" variant="outline" onClick={requestClose}>
                Discard
              </Button>
              <Button
                type="submit"
                loading={form.processing}
                disabled={form.data.title.trim() === ""}
              >
                {form.processing ? "Saving" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>

      <AlertDialog open={confirmingClose} onOpenChange={setConfirmingClose}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Save this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              You can keep this task as a draft and come back to it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="destructive-outline"
              onClick={() => close({ keepDraft: false })}
            >
              Discard
            </Button>
            <AlertDialogClose render={<Button variant="ghost" />}>
              Cancel
            </AlertDialogClose>
            <Button onClick={() => close({ keepDraft: true })}>
              Save draft
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
