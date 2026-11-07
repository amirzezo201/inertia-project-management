import { Link, usePage } from "@inertiajs/react"
import {
  BookOpen,
  ChevronRight,
  CircleUserRound,
  Ellipsis,
  Flag,
  Folder,
  FolderKanban,
  House,
  Link2,
  ListTodo,
  type LucideIcon,
  Plus,
  SlidersHorizontal,
} from "lucide-react"
import type { ReactNode } from "react"

import { NavFooter } from "@/components/nav-footer"
import { ProjectLogo } from "@/components/projects/project-logo"
import { NewTaskDialog } from "@/components/tasks/new-task-dialog"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { toastManager } from "@/components/ui/toast"
import { useClipboard } from "@/hooks/use-clipboard"
import {
  dashboardPath,
  editProjectPath,
  myTasksPath,
  projectMilestonesPath,
  projectPath,
  projectsPath,
  tasksPath,
} from "@/routes"
import type { NavItem, Project } from "@/types"

const footerNavItems: NavItem[] = [
  {
    title: "Repository",
    href: "https://github.com/amirzezo201/rails-inertia-boilerplate",
    icon: Folder,
  },
  {
    title: "Documentation",
    href: "https://inertia-rails.dev",
    icon: BookOpen,
  },
]

function usePath() {
  return usePage().url.split("?")[0]
}

// Plane's sidebar: a header with the collapse button, personal links,
// a "Workspace" section, then "Projects", each expanding into its views.
export function AppSidebar() {
  const path = usePath()
  const { sidebar_projects, project: pageProject } = usePage<{
    project?: Project
  }>().props
  const projects = sidebar_projects ?? []
  // "New task" starts in the project being viewed, if any.
  const currentProject = projects.find((p) => p.id === pageProject?.id)

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      // Sit below the app-wide top bar (h-10).
      className="md:top-10 md:h-[calc(100svh-2.5rem)]"
    >
      <SidebarHeader className="gap-3 px-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="px-1 font-medium text-sm">Projects</span>
          <SidebarTrigger aria-label="Collapse sidebar" />
        </div>
        <NewTaskDialog project={currentProject} trigger="sidebar" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-1">
          <SidebarMenu className="gap-px">
            <NavLink
              title="Home"
              href={dashboardPath()}
              icon={House}
              active={path === dashboardPath()}
            />
            <NavLink
              title="My tasks"
              href={myTasksPath()}
              icon={CircleUserRound}
              active={path === myTasksPath()}
            />
          </SidebarMenu>
        </SidebarGroup>

        <Section label="Workspace">
          <NavLink
            title="Projects"
            href={projectsPath()}
            icon={FolderKanban}
            active={path === projectsPath()}
          />
          <NavLink
            title="All tasks"
            href={tasksPath()}
            icon={ListTodo}
            active={path === tasksPath()}
          />
        </Section>

        <Section
          label="Projects"
          action={
            <SidebarGroupAction
              render={<Link href={projectsPath()} aria-label="New project" />}
              className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/section:opacity-100"
            >
              <Plus />
            </SidebarGroupAction>
          }
        >
          {projects.map((project) => (
            <ProjectNavItem key={project.id} project={project} path={path} />
          ))}
          {projects.length === 0 && (
            <p className="px-2 py-1 text-muted-foreground text-xs">
              No projects yet
            </p>
          )}
        </Section>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <NavFooter items={footerNavItems} />
      </SidebarFooter>
    </Sidebar>
  )
}

// A collapsible sidebar section with a small muted heading (Plane's
// "Workspace" / "Projects" sections).
function Section({
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

function NavLink({
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

// A project row with its logo; it expands into Tasks / Milestones (with
// Plane's guide line) and has a "…" menu on hover.
function ProjectNavItem({ project, path }: { project: Project; path: string }) {
  const { props } = usePage<{ project?: Project }>()
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
      <ProjectMenu project={project} />
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

function ProjectMenu({ project }: { project: Project }) {
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
