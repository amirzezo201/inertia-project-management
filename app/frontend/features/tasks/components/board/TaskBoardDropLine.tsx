import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

// The insertion marker while dragging: a line in the gap where the card would
// land. Positioned by its parent, which must be `relative`.
export function TaskBoardDropLine({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 h-0.5 rounded-full bg-primary",
        className,
      )}
      style={style}
    />
  )
}
