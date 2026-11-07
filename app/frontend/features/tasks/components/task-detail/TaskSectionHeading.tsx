import { ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

// The heading of a collapsible section of the task page (Properties,
// Sub-tasks): a chevron and the label, the whole row toggling the section.
export function TaskSectionHeading({
  label,
  open,
  onToggle,
  tally,
  className,
}: {
  label: string
  open: boolean
  onToggle: () => void
  // Shown after the label (the Sub-tasks section counts the done ones).
  tally?: string
  className?: string
}) {
  const Chevron = open ? ChevronDown : ChevronRight

  return (
    <button
      type="button"
      aria-expanded={open}
      className={cn(
        "flex items-center gap-1 font-medium text-muted-foreground text-xs uppercase tracking-wide hover:text-foreground",
        className,
      )}
      onClick={onToggle}
    >
      <Chevron className="size-3.5" />
      {label}
      {tally && <span className="tabular-nums">{tally}</span>}
    </button>
  )
}
