import type { PropsWithChildren, ReactNode } from "react"

import { AppContent } from "@/components/app-content"
import { AppShell } from "@/components/app-shell"
import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
import { AppTopBar } from "@/components/app-top-bar"
import type { BreadcrumbItem } from "@/types"

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
  header,
}: PropsWithChildren<{
  breadcrumbs?: BreadcrumbItem[]
  header?: ReactNode
}>) {
  return (
    // Plane's frame: a thin top bar across the app, then the sidebar and
    // the main content card side by side.
    <AppShell variant="sidebar" className="flex-col">
      <AppTopBar />
      <div className="flex min-h-0 w-full flex-1">
        <AppSidebar />
        <AppContent variant="sidebar" className="overflow-x-hidden">
          {header ?? <AppSidebarHeader breadcrumbs={breadcrumbs} />}
          {children}
        </AppContent>
      </div>
    </AppShell>
  )
}
