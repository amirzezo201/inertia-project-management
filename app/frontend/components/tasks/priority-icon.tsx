import {
  AlertTriangle,
  Minus,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react"

import { priorityLabels } from "@/lib/tasks"
import { cn } from "@/lib/utils"
import type { TaskPriority } from "@/types"

const icons = {
  no_priority: { icon: Minus, className: "text-muted-foreground" },
  urgent: { icon: AlertTriangle, className: "text-destructive-foreground" },
  high: { icon: SignalHigh, className: "text-foreground" },
  medium: { icon: SignalMedium, className: "text-foreground" },
  low: { icon: SignalLow, className: "text-foreground" },
} satisfies Record<TaskPriority, unknown>

export function PriorityIcon({
  priority,
  className,
}: {
  priority: TaskPriority
  className?: string
}) {
  const { icon: Icon, className: color } = icons[priority]
  return (
    <Icon
      aria-label={priorityLabels[priority]}
      className={cn("size-4 shrink-0", color, className)}
    />
  )
}
