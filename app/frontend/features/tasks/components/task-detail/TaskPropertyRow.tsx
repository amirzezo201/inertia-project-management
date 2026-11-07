import type { ReactNode } from "react"

// One property row: the name and the control are two cells of the Properties
// grid, so this renders no element of its own around them.
export function TaskPropertyRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <>
      <div
        className="truncate pt-1 text-muted-foreground text-sm"
        title={label}
      >
        {label}
      </div>
      <div className="min-w-0">{children}</div>
    </>
  )
}
