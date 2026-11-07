import { cn } from "@/lib/utils"
import type { ProjectOption } from "@/types"

// A small tile with the project's initial, standing in for Plane's project logo.
export function ProjectLogo({
  project,
  className,
}: {
  project: ProjectOption
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-sm bg-primary/10 font-semibold text-[0.625rem] text-primary",
        className,
      )}
    >
      {project.identifier.charAt(0)}
    </span>
  )
}
