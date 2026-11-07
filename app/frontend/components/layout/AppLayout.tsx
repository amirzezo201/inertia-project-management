import type { ReactNode } from "react"

import AppLayoutTemplate from "@/components/layout/AppSidebarLayout"
import type { BreadcrumbItem } from "@/types"

interface AppLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  // Replaces the breadcrumb bar, e.g. with a Huly-style <PageHeader>.
  header?: ReactNode
}

export default function AppLayout({
  children,
  breadcrumbs,
  header,
  ...props
}: AppLayoutProps) {
  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} header={header} {...props}>
      {children}
    </AppLayoutTemplate>
  )
}
