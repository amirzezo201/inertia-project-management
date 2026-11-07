import { Link, usePage } from "@inertiajs/react"
import { ChevronRight, Flag, ListTodo } from "lucide-react"

import { ProjectLogo } from "@/components/common/ProjectLogo"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { projectMilestonesPath, projectPath } from "@/routes"
import type { ProjectOption } from "@/types"
import { AppSidebarProjectMenu } from "./AppSidebarProjectMenu"

// A project row with its logo; it expands into Tasks / Milestones (with
// Plane's guide line) and has a "…" menu on hover.
export function AppSidebarProjectItem({
  project,
  path,
}: {
  project: ProjectOption
  path: string
}) {
  const { props } = usePage<{ project?: ProjectOption }>()
  const isCurrent = props.project?.id === project.id

  const views = [
    { title: "Tasks", href: projectPath(project.id), icon: ListTodo },
    {
      title: "Milestones",
      href: projectMilestonesPath(project.id),
      icon: Flag,
    },
  ]

  return (
    <Collapsible defaultOpen={isCurrent} render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={<SidebarMenuButton className="group/project pe-8" />}
      >
        <ProjectLogo project={project} />
        <span>{project.name}</span>
        <ChevronRight className="ms-auto size-3.5 text-muted-foreground opacity-0 transition-[transform,opacity] group-hover/project:opacity-100 group-data-panel-open/project:rotate-90" />
      </CollapsibleTrigger>
      <AppSidebarProjectMenu project={project} />
      <CollapsiblePanel>
        <SidebarMenuSub className="me-0 gap-px">
          {views.map((view) => (
            <SidebarMenuSubItem key={view.title}>
              <SidebarMenuSubButton
                render={<Link href={view.href} prefetch />}
                isActive={path === view.href}
              >
                <view.icon />
                <span>{view.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsiblePanel>
    </Collapsible>
  )
}
