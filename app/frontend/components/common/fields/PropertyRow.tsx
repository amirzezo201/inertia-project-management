import type { ReactNode } from "react"

// A label/value row in a detail page's side panel (Status, Priority, …).
export function PropertyRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-center gap-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
