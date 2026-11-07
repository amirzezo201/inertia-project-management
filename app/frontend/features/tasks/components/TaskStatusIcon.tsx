import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleX,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { StatusCategory } from "@/types"

const icons = {
  backlog: { icon: CircleDashed, className: "text-muted-foreground" },
  unstarted: { icon: Circle, className: "text-muted-foreground" },
  started: { icon: CircleDot, className: "text-warning-foreground" },
  completed: { icon: CircleCheck, className: "text-success-foreground" },
  canceled: { icon: CircleX, className: "text-muted-foreground" },
} satisfies Record<StatusCategory, unknown>

export function TaskStatusIcon({
  category,
  className,
}: {
  category: StatusCategory
  className?: string
}) {
  const { icon: Icon, className: color } = icons[category]
  return (
    <Icon aria-hidden className={cn("size-4 shrink-0", color, className)} />
  )
}
