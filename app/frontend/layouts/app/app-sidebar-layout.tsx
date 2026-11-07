import type { PropsWithChildren, ReactNode } from "react"

import { AppContent } from "@/components/app-content"
import { AppShell } from "@/components/app-shell"
import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
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
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar" className="overflow-x-hidden">
        {header ?? <AppSidebarHeader breadcrumbs={breadcrumbs} />}
        {children}
      </AppContent>
    </AppShell>
  )
}
