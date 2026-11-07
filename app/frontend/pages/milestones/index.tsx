import { Head, Link } from "@inertiajs/react"
import { Flag } from "lucide-react"

import { NewMilestoneDialog } from "@/components/milestones/new-milestone-dialog"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import AppLayout from "@/layouts/app-layout"
import {
  formatDate,
  milestoneBadgeVariant,
  milestoneStatusLabels,
} from "@/lib/tasks"
import { milestonePath, projectMilestonesPath } from "@/routes"
import type { Milestone, ProjectProps } from "@/types"

export default function MilestonesIndex({
  project,
  milestones,
  mode,
}: ProjectProps & { mode: string }) {
  const href = (mode?: string) =>
    projectMilestonesPath(project.id, mode ? { mode } : {})
  const modes = [
    { value: "all", label: "All", href: href() },
    { value: "planned", label: "Planned", href: href("planned") },
    { value: "active", label: "Active", href: href("active") },
    { value: "closed", label: "Closed", href: href("closed") },
  ]

  return (
    <AppLayout
      header={
        <PageHeader
          icon={<Flag />}
          title={
            <>
              {project.name}{" "}
              <span className="font-normal text-muted-foreground">
                · Milestones
              </span>
            </>
          }
          actions={<NewMilestoneDialog project={project} />}
          modes={modes}
          mode={mode}
        />
      }
    >
      <Head title={`${project.name} milestones`} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {milestones.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Flag />
              </EmptyMedia>
              <EmptyTitle>No milestones</EmptyTitle>
              <EmptyDescription>
                {mode === "all"
                  ? "Group tasks toward a goal with a target date."
                  : "Nothing in this view."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y rounded-lg border">
            {milestones.map((milestone) => (
              <MilestoneRow key={milestone.id} milestone={milestone} />
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  )
}

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  const percent = milestone.tasks_count
    ? Math.round(
        (milestone.completed_tasks_count / milestone.tasks_count) * 100,
      )
    : 0

  return (
    <li>
      <Link
        href={milestonePath(milestone.id)}
        prefetch
        className="flex items-center gap-4 px-3 py-3 text-sm hover:bg-accent/50"
      >
        <Flag className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {milestone.name}
        </span>
        <Badge variant={milestoneBadgeVariant[milestone.status]}>
          {milestoneStatusLabels[milestone.status]}
        </Badge>
        <span className="hidden w-32 text-muted-foreground text-xs sm:block">
          {milestone.target_date
            ? `Due ${formatDate(milestone.target_date)}`
            : "No target date"}
        </span>
        <div className="hidden w-40 items-center gap-2 md:flex">
          <Progress value={percent} aria-label={`${percent}% complete`} />
          <span className="w-16 text-right text-muted-foreground text-xs tabular-nums">
            {milestone.completed_tasks_count}/{milestone.tasks_count}
          </span>
        </div>
      </Link>
    </li>
  )
}
