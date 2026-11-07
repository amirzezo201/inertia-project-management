import { Link, usePage } from "@inertiajs/react"
import {
  BookOpen,
  CircleUserRound,
  Folder,
  FolderKanban,
  House,
  ListTodo,
  Plus,
} from "lucide-react"
import AppLogoIcon from "@/components/brand/AppLogoIcon"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarHeader,
  SidebarMenu,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { NewTaskDialog } from "@/features/tasks/components/NewTaskDialog"
import { dashboardPath, myTasksPath, projectsPath, tasksPath } from "@/routes"
import type { NavItem, ProjectOption } from "@/types"
import { AppSidebarNavLink } from "./AppSidebarNavLink"
import { AppSidebarProjectItem } from "./AppSidebarProjectItem"
import { AppSidebarSearch } from "./AppSidebarSearch"
import { AppSidebarSection } from "./AppSidebarSection"
import { NavFooter } from "./NavFooter"
import { NavUser } from "./NavUser"

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

// itsaplan's sidebar: the brand with the collapse button, search and "New
// task", personal links, a "Workspace" section, then "Projects", each
// expanding into its views. The account menu sits at the bottom.
export function AppSidebar() {
  const path = usePath()
  const { sidebar_projects, project: pageProject } = usePage<{
    project?: ProjectOption
  }>().props
  const projects = sidebar_projects ?? []
  // "New task" starts in the project being viewed, if any.
  const currentProject = projects.find((p) => p.id === pageProject?.id)

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader className="gap-2 px-3 pt-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={dashboardPath()}
            className="flex min-w-0 items-center gap-2 rounded-sm p-1 hover:bg-sidebar-accent"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
              <AppLogoIcon className="size-3.5 fill-current" />
            </span>
            <span className="truncate font-medium text-sm">
              {import.meta.env.VITE_APP_NAME ?? "RunwellForAgents"}
            </span>
          </Link>
          <SidebarTrigger aria-label="Collapse sidebar" />
        </div>
        <AppSidebarSearch />
        <NewTaskDialog project={currentProject} trigger="sidebar" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-1">
          <SidebarMenu className="gap-px">
            <AppSidebarNavLink
              title="Home"
              href={dashboardPath()}
              icon={House}
              active={path === dashboardPath()}
            />
            <AppSidebarNavLink
              title="My tasks"
              href={myTasksPath()}
              icon={CircleUserRound}
              active={path === myTasksPath()}
            />
          </SidebarMenu>
        </SidebarGroup>

        <AppSidebarSection label="Workspace">
          <AppSidebarNavLink
            title="Projects"
            href={projectsPath()}
            icon={FolderKanban}
            active={path === projectsPath()}
          />
          <AppSidebarNavLink
            title="All tasks"
            href={tasksPath()}
            icon={ListTodo}
            active={path === tasksPath()}
          />
        </AppSidebarSection>

        <AppSidebarSection
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
            <AppSidebarProjectItem
              key={project.id}
              project={project}
              path={path}
            />
          ))}
          {projects.length === 0 && (
            <p className="px-2 py-1 text-muted-foreground text-xs">
              No projects yet
            </p>
          )}
        </AppSidebarSection>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <NavFooter items={footerNavItems} />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
