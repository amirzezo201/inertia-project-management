import { router } from "@inertiajs/react"
import type { ReactNode } from "react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"

export interface PageMode {
  value: string
  label: string
  href: string
}

interface PageHeaderProps {
  title: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  modes?: PageMode[]
  mode?: string
}

// Huly's page header: a title row with actions, then view-mode tabs
// (All / Active / Backlog) that switch what the list shows.
export function PageHeader({
  title,
  icon,
  actions,
  modes,
  mode,
}: PageHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col border-sidebar-border/50 border-b">
      <div className="flex h-12 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex min-w-0 items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
          {icon}
          <h1 className="truncate font-semibold text-sm">{title}</h1>
        </div>
        {actions && (
          <div className="ms-auto flex items-center gap-2">{actions}</div>
        )}
      </div>

      {modes && (
        <Tabs
          value={mode}
          onValueChange={(value) => {
            const target = modes.find((m) => m.value === value)
            if (target) router.visit(target.href, { preserveScroll: true })
          }}
          className="px-3"
        >
          <TabsList variant="underline">
            {modes.map((m) => (
              <TabsTab key={m.value} value={m.value}>
                {m.label}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      )}
    </header>
  )
}
