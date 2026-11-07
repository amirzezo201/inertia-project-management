import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

// Like Plane: the sidebar's own header has the collapse button, so page
// headers only show a toggle when the sidebar is hidden (or on mobile).
export function SidebarToggle() {
  const { state, isMobile } = useSidebar()

  if (state === "expanded" && !isMobile) return null
  return <SidebarTrigger className="-ml-1" />
}
