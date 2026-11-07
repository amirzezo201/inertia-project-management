import type { ReactNode } from "react"

export function ActivityValue({ children }: { children: ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>
}
