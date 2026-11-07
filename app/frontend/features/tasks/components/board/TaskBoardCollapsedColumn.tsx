import { ChevronsLeftRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Status } from "@/types"

import { TaskStatusIcon } from "../TaskStatusIcon"

// A column collapsed to a narrow strip. It keeps its place in the column order
// and shows its name vertically with its count.
export function TaskBoardCollapsedColumn({
  status,
  count,
  onExpand,
}: {
  status: Status
  count: number
  onExpand: () => void
}) {
  return (
    <div className="flex w-10 shrink-0 flex-col items-center gap-2 rounded-md bg-kanban-column py-2">
      <Button
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground"
        onClick={onExpand}
        aria-label={`Expand ${status.name}`}
        title="Expand"
      >
        <ChevronsLeftRight />
      </Button>
      <TaskStatusIcon category={status.category} className="size-3.5" />
      <div className="flex flex-1 items-start gap-2 font-medium text-sm [writing-mode:vertical-rl]">
        <span className="text-foreground">{status.name}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
    </div>
  )
}
