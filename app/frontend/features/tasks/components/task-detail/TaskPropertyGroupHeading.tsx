import { cn } from "@/lib/utils"

// The heading of one group of properties, spanning both columns of the
// Properties grid: a hairline and the label.
export function TaskPropertyGroupHeading({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "col-span-2 flex items-center gap-1.5 text-muted-foreground/70",
        className,
      )}
    >
      <span className="h-px flex-1 bg-border/60" />
      <span className="font-semibold text-[10px] uppercase tracking-wide">
        {label}
      </span>
    </div>
  )
}
