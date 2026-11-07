import { useState } from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import * as storage from "@/lib/storage"

interface AppShellProps {
  children: React.ReactNode
  variant?: "header" | "sidebar"
  className?: string
}

export function AppShell({
  children,
  variant = "header",
  className,
}: AppShellProps) {
  const [isOpen, setIsOpen] = useState(
    () => storage.getItem("sidebar") !== "false",
  )

  const handleSidebarChange = (open: boolean) => {
    setIsOpen(open)
    storage.setItem("sidebar", String(open))
  }

  if (variant === "header") {
    return <div className="flex min-h-screen w-full flex-col">{children}</div>
  }

  return (
    <SidebarProvider
      defaultOpen={isOpen}
      open={isOpen}
      onOpenChange={handleSidebarChange}
      className={className}
      // Plane's sidebar is 250px wide.
      style={{ "--sidebar-width": "15.625rem" } as React.CSSProperties}
    >
      {children}
    </SidebarProvider>
  )
}
