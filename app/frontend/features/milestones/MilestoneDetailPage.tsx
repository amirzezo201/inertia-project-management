import { Head, Link, router, usePage } from "@inertiajs/react"
import { Trash2 } from "lucide-react"
import { RichTextEditor } from "@/components/common/editor/RichTextEditor"
import { DatePill } from "@/components/common/fields/DatePill"
import { PillSelect } from "@/components/common/fields/PillSelect"
import { PropertyRow } from "@/components/common/fields/PropertyRow"
import AppLayout from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { NewTaskDialog } from "@/features/tasks/components/NewTaskDialog"
import { TaskList } from "@/features/tasks/components/TaskList"
import { milestoneStatusPillOptions } from "@/features/tasks/utils/taskPillOptions"
import {
  milestonePath,
  projectMilestonesPath,
  projectPath,
  projectsPath,
} from "@/routes"
import type { Milestone, ProjectProps, TaskSummary } from "@/types"
import { milestoneBadgeVariant, milestoneStatusLabels } from "@/utils/tasks"

interface MilestoneShowProps extends ProjectProps {
  milestone: Milestone
  tasks: TaskSummary[]
}

// Huly's milestone view: edit in place, properties in the side panel.
export default function MilestoneShow(props: MilestoneShowProps) {
  const { project, milestone, tasks } = props
  const { errors } = usePage().props
  const percent = milestone.tasks_count
    ? Math.round(
        (milestone.completed_tasks_count / milestone.tasks_count) * 100,
      )
    : 0

  function save(attributes: Record<string, string>) {
    router.patch(milestonePath(milestone.id), attributes, {
      preserveScroll: true,
      preserveState: true,
    })
  }

  const errorMessages = Object.entries(errors).flatMap(([key, messages]) =>
    [messages].flat().map((message) => `${key.replace(/_/g, " ")} ${message}`),
  )

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Projects", href: projectsPath() },
        { title: project.name, href: projectPath(project.id) },
        { title: "Milestones", href: projectMilestonesPath(project.id) },
        { title: milestone.name, href: milestonePath(milestone.id) },
      ]}
    >
      <Head title={milestone.name} />

      <div
        key={milestone.id}
        className="grid flex-1 gap-6 p-4 lg:grid-cols-[1fr_18rem]"
      >
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              aria-label="Milestone name"
              defaultValue={milestone.name}
              className="min-w-0 flex-1 rounded-md bg-transparent font-semibold text-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/24"
              onBlur={(event) => {
                const name = event.target.value.trim()
                if (name === "") event.target.value = milestone.name
                else if (name !== milestone.name) save({ name })
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur()
              }}
            />
            <Badge variant={milestoneBadgeVariant[milestone.status]}>
              {milestoneStatusLabels[milestone.status]}
            </Badge>
          </div>

          <RichTextEditor
            content={milestone.description}
            placeholder="Click to add description"
            slashCommands
            mentions={props.users}
            onBlur={(html) => {
              if (html !== (milestone.description ?? ""))
                save({ description: html })
            }}
          />

          {errorMessages.length > 0 && (
            <p className="text-destructive-foreground text-sm">
              {errorMessages.join(". ")}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Progress value={percent} aria-label={`${percent}% complete`} />
            <span className="shrink-0 text-muted-foreground text-sm tabular-nums">
              {milestone.completed_tasks_count} of {milestone.tasks_count} done
            </span>
            <NewTaskDialog {...props} milestoneId={milestone.id} />
          </div>

          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No tasks in this milestone yet.
            </p>
          ) : (
            <TaskList {...props} hideMilestone />
          )}
        </div>

        <aside className="flex flex-col gap-3 lg:border-l lg:pl-6">
          <PropertyRow label="Status">
            <PillSelect
              label="Status"
              value={milestone.status}
              options={milestoneStatusPillOptions()}
              onChange={(value) => save({ status: value })}
            />
          </PropertyRow>
          <PropertyRow label="Start date">
            <DatePill
              label="Start date"
              value={milestone.start_date ?? ""}
              onChange={(value) => save({ start_date: value })}
            />
          </PropertyRow>
          <PropertyRow label="Target date">
            <DatePill
              label="Target date"
              value={milestone.target_date ?? ""}
              onChange={(value) => save({ target_date: value })}
            />
          </PropertyRow>

          <Button
            variant="destructive-outline"
            size="sm"
            className="mt-4 self-start"
            render={
              <Link
                href={milestonePath(milestone.id)}
                method="delete"
                as="button"
                onBefore={() =>
                  confirm(`Delete ${milestone.name}? Its tasks will be kept.`)
                }
              />
            }
          >
            <Trash2 />
            Delete milestone
          </Button>
        </aside>
      </div>
    </AppLayout>
  )
}
