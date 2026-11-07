import type { PropsWithChildren } from "react"

import { AppContent } from "@/components/layout/AppContent"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppShell } from "@/components/layout/AppShell"
import type { BreadcrumbItem } from "@/types"

export default function AppHeaderLayout({
  children,
  breadcrumbs,
}: PropsWithChildren<{
  breadcrumbs?: BreadcrumbItem[]
}>) {
  return (
    <AppShell>
      <AppHeader breadcrumbs={breadcrumbs} />
      <AppContent>{children}</AppContent>
    </AppShell>
  )
}
