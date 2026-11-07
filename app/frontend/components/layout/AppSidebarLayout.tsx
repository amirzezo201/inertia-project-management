import type { PropsWithChildren, ReactNode } from "react"

import { AppContent } from "@/components/layout/AppContent"
import { AppShell } from "@/components/layout/AppShell"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppSidebarHeader } from "@/components/layout/AppSidebarHeader"
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
    // itsaplan's frame: the sidebar (brand, search, navigation, account) and
    // the main content card side by side, with no bar across the top.
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar" className="overflow-x-hidden">
        {header ?? <AppSidebarHeader breadcrumbs={breadcrumbs} />}
        {children}
      </AppContent>
    </AppShell>
  )
}
