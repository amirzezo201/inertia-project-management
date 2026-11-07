import { Link } from "@inertiajs/react"
import { CornerLeftUp } from "lucide-react"

import { taskPath } from "@/routes"
import type { TaskSummary } from "@/types"

// Above a sub-task's title: which task it belongs to, linking back to it, so a
// sub-task's page never reads as its parent's.
export function TaskParentLink({ parent }: { parent: TaskSummary }) {
  return (
    <Link
      href={taskPath(parent.id)}
      title={`Open ${parent.identifier}`}
      className="mb-1 flex w-fit max-w-full items-center gap-1.5 rounded-md text-muted-foreground text-xs hover:text-foreground"
    >
      <CornerLeftUp className="size-3.5 shrink-0" />
      <span className="shrink-0">Sub-task of</span>
      <span className="shrink-0 font-medium">{parent.identifier}</span>
      <span className="truncate">{parent.title}</span>
    </Link>
  )
}
