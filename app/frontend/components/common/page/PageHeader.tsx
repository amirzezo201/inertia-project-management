import { Link } from "@inertiajs/react"
import { ChevronRight } from "lucide-react"
import { Fragment, type ReactNode } from "react"

import { SidebarToggle } from "@/components/layout/SidebarToggle"
import { cn } from "@/lib/utils"
import { PageHeaderModeFilter } from "./PageHeaderModeFilter"

export interface PageCrumb {
  title: ReactNode
  href?: string
  icon?: ReactNode
}

export interface PageMode {
  value: string
  label: string
  href: string
}

interface PageHeaderProps {
  breadcrumbs: PageCrumb[]
  // Shown as a small chip after the last crumb (e.g. number of tasks).
  count?: number
  // View filters (All / Active / Backlog); the first one is the default.
  modes?: PageMode[]
  mode?: string
  // Shown before Filters, e.g. the List / Board switcher.
  layoutSwitcher?: ReactNode
  actions?: ReactNode
}

// Plane's page header: one 48px row with breadcrumbs and a count on the
// left, and Filters plus the primary action on the right.
export function PageHeader({
  breadcrumbs,
  count,
  modes,
  mode,
  layoutSwitcher,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-5">
      <SidebarToggle />

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1.5 text-sm"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          const content = (
            <span className="flex min-w-0 items-center gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
              {crumb.icon}
              <span className="max-w-[150px] truncate">{crumb.title}</span>
            </span>
          )

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: crumbs are a fixed, ordered list per page
            <Fragment key={index}>
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="rounded-sm px-1 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {content}
                </Link>
              ) : (
                <span
                  className={cn(
                    "px-1 py-0.5",
                    isLast ? "font-medium" : "text-muted-foreground",
                  )}
                >
                  {content}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/72" />
              )}
            </Fragment>
          )
        })}
        {count !== undefined && (
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground text-xs tabular-nums">
            {count}
          </span>
        )}
      </nav>

      <div className="ms-auto flex shrink-0 items-center gap-2">
        {layoutSwitcher}
        {modes && <PageHeaderModeFilter modes={modes} mode={mode} />}
        {actions}
      </div>
    </header>
  )
}
