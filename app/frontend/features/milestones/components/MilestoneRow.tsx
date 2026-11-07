import { Link } from "@inertiajs/react"
import { Flag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { milestonePath } from "@/routes"
import type { MilestoneSummary } from "@/types"
import {
  formatDate,
  milestoneBadgeVariant,
  milestoneStatusLabels,
} from "@/utils/tasks"

export function MilestoneRow({ milestone }: { milestone: MilestoneSummary }) {
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
