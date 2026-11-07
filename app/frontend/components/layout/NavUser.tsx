import { usePage } from "@inertiajs/react"
import { ChevronsUpDown } from "lucide-react"
import { UserInfo } from "@/components/layout/UserInfo"
import { UserMenuContent } from "@/components/layout/UserMenuContent"
import { Menu, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-media-query"

export function NavUser() {
  const { auth } = usePage().props
  const { state } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="group text-sidebar-accent-foreground data-popup-open:bg-sidebar-accent"
              />
            }
          >
            <UserInfo user={auth.user} />
            <ChevronsUpDown className="ml-auto size-4" />
          </MenuTrigger>
          <MenuPopup
            className="w-(--anchor-width) min-w-56"
            align="end"
            // It sits at the foot of the sidebar, so the menu opens upward.
            side={isMobile ? "top" : state === "collapsed" ? "left" : "top"}
          >
            <UserMenuContent auth={auth} />
          </MenuPopup>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
