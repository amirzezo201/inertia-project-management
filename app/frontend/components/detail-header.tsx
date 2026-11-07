import type { ReactNode } from "react"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { BreadcrumbItem } from "@/types"

interface DetailHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  status?: ReactNode
  actions?: ReactNode
}

// Huly's document panel header: "Project › Parent › ID" on the left, a save
// indicator and document actions (copy link, more) on the right.
export function DetailHeader({
  breadcrumbs,
  status,
  actions,
}: DetailHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-sidebar-border/50 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="ms-auto flex items-center gap-1">
        {status && (
          <span className="me-2 text-muted-foreground text-xs">{status}</span>
        )}
        {actions}
      </div>
    </header>
  )
}
