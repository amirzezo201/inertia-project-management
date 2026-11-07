import { Head, Link, router, usePage } from "@inertiajs/react"
import {
  ChevronRight,
  Clock,
  Copy,
  CornerLeftUp,
  Ellipsis,
  Flag,
  Link2,
  ListTodo,
  LoaderCircle,
  Trash2,
  UserRound,
} from "lucide-react"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"

import { ActivitySection } from "@/components/activity/activity-section"
import { DateTimeText, TimeAgo } from "@/components/activity/time-ago"
import { PageHeader } from "@/components/page-header"
import { ProjectLogo } from "@/components/projects/project-logo"
import { DatePill, EstimatePill, PillSelect } from "@/components/property-pills"
import { RichTextEditor } from "@/components/rich-text-editor"
import { NewTaskDialog } from "@/components/tasks/new-task-dialog"
import { TaskRow } from "@/components/tasks/task-list"
import {
  assigneePillOptions,
  milestonePillOptions,
  priorityPillOptions,
  statusPillOptions,
} from "@/components/tasks/task-pill-options"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { toastManager } from "@/components/ui/toast"
import { useClipboard } from "@/hooks/use-clipboard"
import AppLayout from "@/layouts/app-layout"
import { cn } from "@/lib/utils"
import { projectPath, taskCommentsPath, taskPath } from "@/routes"
import type { ActivityEvent, ProjectProps, Task, UserSummary } from "@/types"

interface TaskShowProps extends ProjectProps {
  task: Task
  parent: Task | null
  subtasks: Task[]
  activity: ActivityEvent[]
}

type SaveState = "idle" | "saving" | "saved"

// Plane's work item page: a document column (meta row, title, the main
// properties, description, sub-tasks, activity) and a properties sidebar.
// Everything saves in place.
export default function TaskShow(props: TaskShowProps) {
  const { project, users, task, parent, subtasks, activity } = props
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
          actions={<TaskActions task={task} />}
        />
      }
    >
      <Head title={`${task.identifier} ${task.title}`} />

      {/* Keyed by task so uncontrolled fields reset when moving between tasks. */}
      <div key={task.id} className="flex min-h-0 flex-1 flex-col md:flex-row">
        <main className="min-w-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-6">
            <MetaRow task={task} parent={parent} saveState={saveState} />

            <TitleField task={task} onSave={(title) => save({ title })} />

            <PropertyBar {...props} onSave={save} />

            <DescriptionField
              task={task}
              users={users}
              onSave={(description) => save({ description })}
            />

            {errorMessages.length > 0 && (
              <p className="text-destructive-foreground text-sm">
                {errorMessages.join(". ")}
              </p>
            )}

            <div className="inline-flex self-start rounded-lg border bg-muted/40 px-1.5 py-1">
              <NewTaskDialog {...props} parent={task} trigger="ghost" />
            </div>

            {subtasks.length > 0 && <SubtasksSection {...props} />}

            <div className="border-t pt-8">
              <ActivitySection
                activity={activity}
                users={users}
                commentsPath={taskCommentsPath(task.id)}
              />
            </div>
          </div>
        </main>

        <PropertiesSidebar {...props} onSave={save} />
      </div>
    </AppLayout>
  )
}

function MetaRow({
  task,
  parent,
  saveState,
}: {
  task: Task
  parent: Task | null
  saveState: SaveState
}) {
  const [, copy] = useClipboard()

  return (
    <div className="flex h-6 items-center justify-between gap-2 font-medium text-xs">
      <div className="flex min-w-0 items-center gap-1.5">
        {parent && (
          <>
            <Link
              href={taskPath(parent.id)}
              title={parent.title}
              className="flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-muted-foreground hover:text-foreground"
            >
              <CornerLeftUp className="size-3" />
              {parent.identifier}
            </Link>
            <span className="text-muted-foreground">/</span>
          </>
        )}
        <button
          type="button"
          title="Copy ID"
          className="rounded-sm px-1 text-muted-foreground hover:text-foreground"
          onClick={async () => {
            if (await copy(task.identifier)) {
              toastManager.add({
                title: `Copied ${task.identifier}`,
                type: "success",
              })
            }
          }}
        >
          {task.identifier}
        </button>
      </div>

      <span
        className={cn(
          "flex items-center gap-1 font-normal text-muted-foreground transition-opacity",
          saveState === "idle" && "opacity-0",
        )}
        aria-live="polite"
      >
        {saveState === "saving" && (
          <LoaderCircle className="size-3.5 animate-spin" />
        )}
        {saveState === "saving"
          ? "Saving..."
          : saveState === "saved"
            ? "Saved"
            : ""}
      </span>
    </div>
  )
}

// A borderless title that grows with its text and saves on blur.
function TitleField({
  task,
  onSave,
}: {
  task: Task
  onSave: (title: string) => void
}) {
  return (
    <textarea
      aria-label="Title"
      defaultValue={task.title}
      placeholder="Task title"
      rows={1}
      maxLength={255}
      className="field-sizing-content -mx-2 resize-none rounded-md bg-transparent px-2 font-semibold text-2xl outline-none placeholder:text-muted-foreground/72 focus-visible:bg-accent/40"
      onBlur={(event) => {
        const title = event.target.value.trim()
        if (title === "") event.target.value = task.title
        else if (title !== task.title) onSave(title)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
    />
  )
}

// Plane's inline row of the main properties, split by thin dividers.
function PropertyBar({
  task,
  statuses,
  users,
  onSave,
}: TaskShowProps & { onSave: (attributes: Record<string, string>) => void }) {
  const cells = [
    <PillSelect
      key="status"
      variant="ghost"
      label="Status"
      value={String(task.status_id)}
      options={statusPillOptions(statuses)}
      onChange={(value) => onSave({ status_id: value })}
    />,
    <PillSelect
      key="priority"
      variant="ghost"
      label="Priority"
      value={task.priority}
      options={priorityPillOptions()}
      onChange={(value) => onSave({ priority: value })}
    />,
    <PillSelect
      key="assignee"
      variant="ghost"
      label="Assignee"
      value={String(task.assignee_id ?? "")}
      options={assigneePillOptions(users, "Add assignee")}
      onChange={(value) => onSave({ assignee_id: value })}
    />,
    <DatePill
      key="start"
      variant="ghost"
      label="Start date"
      value={task.start_date ?? ""}
      onChange={(value) => onSave({ start_date: value })}
    />,
    <DatePill
      key="due"
      variant="ghost"
      label="Due date"
      value={task.due_date ?? ""}
      onChange={(value) => onSave({ due_date: value })}
    />,
  ]

  return (
    <div className="flex flex-wrap items-center rounded-lg border">
      {cells.map((cell, index) => (
        <div
          key={cell.key}
          className={cn("min-w-28 flex-1 px-1 py-0.5", index > 0 && "border-l")}
        >
          {cell}
        </div>
      ))}
    </div>
  )
}

const DESCRIPTION_CLAMP = 140

// The description editor, collapsed to 140px with "Show all" when long.
function DescriptionField({
  task,
  users,
  onSave,
}: {
  task: Task
  users: UserSummary[]
  onSave: (description: string) => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useLayoutEffect(() => {
    const element = contentRef.current
    if (!element) return
    const observer = new ResizeObserver(() =>
      setOverflows(element.scrollHeight > DESCRIPTION_CLAMP + 24),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const clamped = overflows && !expanded

  return (
    <div>
      <div
        ref={contentRef}
        onFocusCapture={() => setExpanded(true)}
        className={cn("relative", clamped && "overflow-hidden")}
        style={clamped ? { maxHeight: DESCRIPTION_CLAMP } : undefined}
      >
        <RichTextEditor
          content={task.description}
          placeholder="Click to add description"
          editorClassName="min-h-16"
          slashCommands
          mentions={users}
          onBlur={(html) => {
            if (html !== (task.description ?? "")) onSave(html)
          }}
        />
        {clamped && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background" />
        )}
      </div>
      {overflows && (
        <button
          type="button"
          className="mt-1 text-primary text-sm hover:underline"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  )
}

// Plane's collapsible "Sub-work items" section with a progress chip.
function SubtasksSection(props: TaskShowProps) {
  const { task, statuses, milestones, users, subtasks } = props
  const done = subtasks.filter((subtask) => {
    const category = statuses.find((s) => s.id === subtask.status_id)?.category
    return category === "completed" || category === "canceled"
  }).length

  return (
    <Collapsible
      defaultOpen
      render={<section className="flex flex-col gap-3" />}
    >
      <div className="flex min-h-6 items-center gap-2">
        <CollapsibleTrigger className="group/sub flex items-center gap-1.5 font-medium text-xs">
          Sub-tasks
          <span className="text-muted-foreground">{subtasks.length}</span>
          <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-data-panel-open/sub:rotate-90" />
        </CollapsibleTrigger>
        <span
          className="flex h-5 items-center gap-1 rounded-sm bg-muted px-1.5 font-medium text-muted-foreground text-xs tabular-nums"
          title={`${done} of ${subtasks.length} done`}
        >
          {done}/{subtasks.length}
        </span>
        <div className="ms-auto">
          <NewTaskDialog {...props} parent={task} trigger="icon" />
        </div>
      </div>
      <CollapsiblePanel>
        <ul className="overflow-hidden rounded-lg border">
          {subtasks.map((subtask) => (
            <TaskRow
              key={subtask.id}
              task={subtask}
              statuses={statuses}
              milestones={milestones}
              users={users}
              hideMilestone
            />
          ))}
        </ul>
      </CollapsiblePanel>
    </Collapsible>
  )
}

function PropertiesSidebar({
  task,
  parent,
  milestones,
  users,
  onSave,
}: TaskShowProps & { onSave: (attributes: Record<string, string>) => void }) {
  const creator = users.find((user) => user.id === task.creator_id)

  return (
    <aside className="flex shrink-0 flex-col gap-5 overflow-y-auto border-t px-6 py-6 md:w-80 md:border-t-0 md:border-l">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold text-sm">Properties</h2>
        <span className="text-muted-foreground text-xs">
          Updated <TimeAgo date={task.updated_at} className="text-xs" />
        </span>
      </div>

      <PropertyGroup label="Details">
        <PropertyItem icon={<CornerLeftUp />} label="Parent">
          {parent ? (
            <Link
              href={taskPath(parent.id)}
              className="flex h-8 items-center gap-1.5 truncate rounded-md px-2 text-sm hover:bg-accent"
            >
              <span className="text-muted-foreground text-xs">
                {parent.identifier}
              </span>
              <span className="truncate">{parent.title}</span>
            </Link>
          ) : (
            <span className="flex h-8 items-center px-2 text-muted-foreground text-sm">
              None
            </span>
          )}
        </PropertyItem>
        <PropertyItem icon={<Clock />} label="Estimate">
          <EstimateField
            task={task}
            onSave={(estimation) => onSave({ estimation })}
          />
        </PropertyItem>
      </PropertyGroup>

      <PropertyGroup label="Project structure">
        <PropertyItem icon={<Flag />} label="Milestone">
          <PillSelect
            variant="ghost"
            label="Milestone"
            value={String(task.milestone_id ?? "")}
            options={milestonePillOptions(milestones, "No milestone")}
            onChange={(value) => onSave({ milestone_id: value })}
          />
        </PropertyItem>
      </PropertyGroup>

      <dl className="flex flex-col gap-1 border-t pt-5 text-muted-foreground text-xs">
        <div className="flex items-center gap-1.5">
          <UserRound className="size-3.5" />
          <dt className="sr-only">Created by</dt>
          <dd>Created by {creator?.name ?? "Unknown"}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <ListTodo className="size-3.5" />
          <dt className="sr-only">Created on</dt>
          <dd>
            Created on <DateTimeText date={task.created_at} />
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <dt className="sr-only">Updated on</dt>
          <dd>
            Updated on <DateTimeText date={task.updated_at} />
          </dd>
        </div>
      </dl>
    </aside>
  )
}

// A collapsible group in the properties sidebar ("Details", "Project structure").
function PropertyGroup({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Collapsible
      defaultOpen
      render={<section className="flex flex-col gap-2 border-t pt-5" />}
    >
      <CollapsibleTrigger className="group/group flex items-center gap-1.5 self-start py-1 font-semibold text-xs">
        <ChevronRight className="size-3 text-muted-foreground transition-transform group-data-panel-open/group:rotate-90" />
        {label}
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="flex flex-col gap-1">{children}</div>
      </CollapsiblePanel>
    </Collapsible>
  )
}

function PropertyItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex min-h-8 w-28 shrink-0 items-center gap-1.5 text-muted-foreground text-xs [&_svg]:size-4">
        {icon}
        {label}
      </span>
      <div className="min-w-0 grow">{children}</div>
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

// Copy link and the "more" menu in the header, like Plane's work item header.
function TaskActions({ task }: { task: Task }) {
  const [, copy] = useClipboard()

  async function copyText(text: string, title: string) {
    if (await copy(text)) toastManager.add({ title, type: "success" })
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Copy link"
        title="Copy link"
        onClick={() => copyText(window.location.href, "Link copied!")}
      >
        <Link2 />
      </Button>
      <Menu>
        <MenuTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="More actions"
            />
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
