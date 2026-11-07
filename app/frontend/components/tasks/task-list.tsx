import { Link, router } from "@inertiajs/react"
import { Flag, ListTree, Plus, UserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { UserAvatar } from "@/components/activity/user-avatar"
import {
  DatePill,
  type PillOption,
  PillSelect,
} from "@/components/property-pills"
import { StatusIcon } from "@/components/tasks/status-icon"
import {
  priorityPillOptions,
  statusPillOptions,
} from "@/components/tasks/task-pill-options"
import { Button } from "@/components/ui/button"
import { categoryLabels, isOverdue } from "@/lib/tasks"
import { cn } from "@/lib/utils"
import { projectTasksPath, taskPath } from "@/routes"
import type {
  Milestone,
  Project,
  Status,
  StatusCategory,
  Task,
  UserSummary,
} from "@/types"

interface TaskListProps {
  tasks: Task[]
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
  hideMilestone?: boolean
  // Projects have their own statuses, so lists spanning projects group by
  // status category (Backlog, Todo, In progress, …) instead.
  groupBy?: "status" | "category"
  // On a project's list: show every status (even empty) with an inline
  // "New task" row, like Plane.
  project?: Project
}

interface TaskGroup {
  key: string
  label: string
  category: StatusCategory
  statusId?: number
  tasks: Task[]
}

// Plane's list layout: sticky group headers, full-width rows with the
// identifier, title and editable property chips, and inline add per group.
export function TaskList({
  tasks,
  statuses,
  milestones,
  users,
  hideMilestone,
  groupBy = "status",
  project,
}: TaskListProps) {
  const statusOf = (task: Task) => statuses.find((s) => s.id === task.status_id)

  const groups: TaskGroup[] =
    groupBy === "category"
      ? (Object.keys(categoryLabels) as StatusCategory[]).map((category) => ({
          key: category,
          label: categoryLabels[category],
          category,
          tasks: tasks.filter((task) => statusOf(task)?.category === category),
        }))
      : statuses.map((status) => ({
          key: String(status.id),
          label: status.name,
          category: status.category,
          statusId: status.id,
          tasks: tasks.filter((task) => task.status_id === status.id),
        }))

  const visibleGroups = project
    ? groups
    : groups.filter((group) => group.tasks.length > 0)
  // Line titles up by giving identifiers the width of the longest one.
  const idWidth = Math.max(0, ...tasks.map((task) => task.identifier.length))

  return (
    <div className="flex flex-col">
      {visibleGroups.map((group) => (
        <TaskGroupSection
          key={group.key}
          group={group}
          project={project}
          idWidth={idWidth}
          rowProps={{ statuses, milestones, users, hideMilestone }}
        />
      ))}
    </div>
  )
}

function TaskGroupSection({
  group,
  project,
  idWidth,
  rowProps,
}: {
  group: TaskGroup
  project?: Project
  idWidth: number
  rowProps: Omit<TaskRowProps, "task" | "idWidth">
}) {
  const [adding, setAdding] = useState(false)
  const canAdd = project !== undefined && group.statusId !== undefined

  return (
    <section>
      <div className="sticky top-0 z-[2] flex items-center gap-2 border-b bg-muted/72 px-5 py-1.5 backdrop-blur">
        <StatusIcon category={group.category} />
        <h2 className="truncate font-medium text-sm">{group.label}</h2>
        <span className="ps-1 font-medium text-muted-foreground text-xs">
          {group.tasks.length}
        </span>
        {canAdd && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="ms-auto"
            aria-label={`New task in ${group.label}`}
            title={`New task in ${group.label}`}
            onClick={() => setAdding(true)}
          >
            <Plus />
          </Button>
        )}
      </div>

      <ul>
        {group.tasks.map((task) => (
          <TaskRow key={task.id} task={task} idWidth={idWidth} {...rowProps} />
        ))}
      </ul>

      {canAdd && (
        <QuickAdd
          project={project}
          statusId={group.statusId as number}
          open={adding}
          onOpenChange={setAdding}
        />
      )}
    </section>
  )
}

interface TaskRowProps {
  task: Task
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
  hideMilestone?: boolean
  idWidth?: number
}

function saveTask(task: Task, attributes: Record<string, string>) {
  router.patch(taskPath(task.id), attributes, {
    preserveScroll: true,
    preserveState: true,
  })
}

function assigneeChipOptions(users: UserSummary[]): PillOption[] {
  return [
    {
      value: "",
      label: "Unassigned",
      icon: <UserRound className="text-muted-foreground" />,
    },
    ...users.map((user) => ({
      value: String(user.id),
      label: user.name,
      icon: <UserAvatar name={user.name} className="size-4" />,
    })),
  ]
}

function milestoneChipOptions(milestones: Milestone[]): PillOption[] {
  const icon = <Flag className="text-muted-foreground" />
  return [
    { value: "", label: "Milestone", icon },
    ...milestones.map((m) => ({ value: String(m.id), label: m.name, icon })),
  ]
}

export function TaskRow({
  task,
  statuses,
  milestones,
  users,
  hideMilestone,
  idWidth,
}: TaskRowProps) {
  return (
    <li className="group/row relative flex min-h-11 items-center gap-3 border-b px-5 py-2 text-sm transition-colors last:border-b-0 hover:bg-accent/40">
      <span
        className="shrink-0 font-medium text-muted-foreground text-xs tabular-nums"
        style={idWidth ? { minWidth: `${idWidth}ch` } : undefined}
      >
        {task.identifier}
      </span>
      {/* The title link covers the row; chips sit above it so they stay clickable. */}
      <Link
        href={taskPath(task.id)}
        prefetch
        className="min-w-0 flex-1 truncate font-medium after:absolute after:inset-0"
      >
        {task.title}
      </Link>

      <TaskProperties
        task={task}
        statuses={statuses}
        milestones={milestones}
        users={users}
        hideMilestone={hideMilestone}
        className="shrink-0"
      />
    </li>
  )
}

interface TaskPropertiesProps {
  task: Task
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
  hideMilestone?: boolean
  // Board cards wrap every chip onto lines; list rows drop some on small screens.
  wrap?: boolean
  className?: string
}

// The editable property chips of a task (Plane's list row / card chips).
export function TaskProperties({
  task,
  statuses,
  milestones,
  users,
  hideMilestone,
  wrap = false,
  className,
}: TaskPropertiesProps) {
  const projectStatuses = statuses.filter(
    (s) => s.project_id === task.project_id,
  )
  const projectMilestones = milestones.filter(
    (m) => m.project_id === task.project_id,
  )
  const status = projectStatuses.find((s) => s.id === task.status_id)
  const closed =
    status?.category === "completed" || status?.category === "canceled"

  return (
    <div
      className={cn(
        "relative z-[1] flex items-center gap-1.5",
        wrap && "flex-wrap",
        className,
      )}
    >
      {task.subtasks_count > 0 && (
        <span
          className={cn(
            "h-6 items-center gap-1 rounded-md border px-1.5 text-muted-foreground text-xs",
            wrap ? "inline-flex" : "hidden sm:inline-flex",
          )}
          title={`${task.subtasks_count} sub-tasks`}
        >
          <ListTree className="size-3.5" />
          {task.subtasks_count}
        </span>
      )}
      <PillSelect
        variant="chip"
        label="Status"
        value={String(task.status_id)}
        options={statusPillOptions(projectStatuses)}
        onChange={(value) => saveTask(task, { status_id: value })}
      />
      <PillSelect
        variant="chip"
        iconOnly
        label="Priority"
        value={task.priority}
        options={priorityPillOptions()}
        onChange={(value) => saveTask(task, { priority: value })}
      />
      <div className={wrap ? undefined : "hidden md:block"}>
        <DatePill
          variant="chip"
          label="Due date"
          value={task.due_date ?? ""}
          className={cn(
            !closed &&
              isOverdue(task.due_date) &&
              "text-destructive-foreground",
          )}
          onChange={(value) => saveTask(task, { due_date: value })}
        />
      </div>
      {!hideMilestone && (
        <div className={wrap ? undefined : "hidden lg:block"}>
          <PillSelect
            variant="chip"
            label="Milestone"
            value={String(task.milestone_id ?? "")}
            options={milestoneChipOptions(projectMilestones)}
            onChange={(value) => saveTask(task, { milestone_id: value })}
          />
        </div>
      )}
      <PillSelect
        variant="chip"
        iconOnly
        label="Assignee"
        value={String(task.assignee_id ?? "")}
        options={assigneeChipOptions(users)}
        onChange={(value) => saveTask(task, { assignee_id: value })}
      />
    </div>
  )
}

// Plane's inline add at the bottom of a group: type a title and press Enter;
// the field stays open for the next one.
export function QuickAdd({
  project,
  statusId,
  open,
  onOpenChange,
  compact = false,
}: {
  project: Project
  statusId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  // Board columns use a tighter, borderless version.
  compact?: boolean
}) {
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the title field when the row opens (and again after each save).
  useEffect(() => {
    if (open && !saving) inputRef.current?.focus()
  }, [open, saving])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className={cn(
          "flex w-full items-center gap-2 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent/40 hover:text-foreground",
          compact ? "rounded-lg px-2 py-1.5" : "border-b px-5 py-2.5",
        )}
      >
        <Plus className="size-3.5" />
        New task
      </button>
    )
  }

  function create() {
    if (title.trim() === "" || saving) return

    router.post(
      projectTasksPath(project.id),
      { title: title.trim(), status_id: String(statusId) },
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => setSaving(true),
        onFinish: () => setSaving(false),
        onSuccess: () => setTitle(""),
      },
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        compact
          ? "rounded-lg border bg-card px-2 py-2"
          : "min-h-12 border-b px-5 py-2",
      )}
    >
      <span className="font-medium text-muted-foreground/72 text-xs">
        {project.identifier}
      </span>
      <input
        ref={inputRef}
        aria-label="Task title"
        value={title}
        disabled={saving}
        placeholder="Task title"
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            create()
          }
          if (event.key === "Escape") onOpenChange(false)
        }}
        onBlur={() => title.trim() === "" && onOpenChange(false)}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/72"
      />
      <span
        className={cn(
          "text-muted-foreground text-xs italic",
          compact ? "hidden" : "hidden sm:block",
        )}
      >
        Press 'Enter' to add another task
      </span>
    </div>
  )
}
