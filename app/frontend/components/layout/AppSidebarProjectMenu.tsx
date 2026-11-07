import { Link } from "@inertiajs/react"
import { Ellipsis, Link2, SlidersHorizontal } from "lucide-react"

import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import { SidebarMenuAction } from "@/components/ui/sidebar"
import { toastManager } from "@/components/ui/toast"
import { useClipboard } from "@/hooks/useClipboard"
import { editProjectPath, projectPath } from "@/routes"
import type { ProjectOption } from "@/types"

export function AppSidebarProjectMenu({ project }: { project: ProjectOption }) {
  const [, copy] = useClipboard()

  return (
    <Menu>
      <MenuTrigger
        render={<SidebarMenuAction showOnHover />}
        aria-label={`${project.name} actions`}
      >
        <Ellipsis />
      </MenuTrigger>
      <MenuPopup side="right" align="start">
        <MenuItem
          onClick={async () => {
            if (
              await copy(
                new URL(projectPath(project.id), window.location.origin).href,
              )
            ) {
              toastManager.add({ title: "Link copied", type: "success" })
            }
          }}
        >
          <Link2 />
          Copy link
        </MenuItem>
        <MenuItem render={<Link href={editProjectPath(project.id)} />}>
          <SlidersHorizontal />
          Settings
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}
