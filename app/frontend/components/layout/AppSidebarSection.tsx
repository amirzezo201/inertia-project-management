import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"

// A collapsible sidebar section with a small muted heading (Plane's
// "Workspace" / "Projects" sections).
export function AppSidebarSection({
  label,
  action,
  children,
}: {
  label: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Collapsible
      defaultOpen
      render={<SidebarGroup className="group/section py-1" />}
    >
      <SidebarGroupLabel
        render={<CollapsibleTrigger />}
        className="group/label cursor-pointer gap-1 font-semibold text-muted-foreground text-xs hover:text-foreground"
      >
        {label}
        <ChevronRight className="size-3 opacity-0 transition-[transform,opacity] group-hover/label:opacity-100 group-data-panel-open/label:rotate-90" />
      </SidebarGroupLabel>
      {action}
      <CollapsiblePanel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-px">{children}</SidebarMenu>
        </SidebarGroupContent>
      </CollapsiblePanel>
    </Collapsible>
  )
}
