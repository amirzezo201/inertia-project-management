import { Link } from "@inertiajs/react"
import type { LucideIcon } from "lucide-react"

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function AppSidebarNavLink({
  title,
  href,
  icon: Icon,
  active,
}: {
  title: string
  href: string
  icon: LucideIcon
  active: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={href} prefetch />}
        isActive={active}
      >
        <Icon />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
