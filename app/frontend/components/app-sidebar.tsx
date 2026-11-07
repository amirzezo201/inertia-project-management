import { Link, usePage } from "@inertiajs/react"
import {
  BookOpen,
  ChevronRight,
  CircleUserRound,
  Flag,
  Folder,
  FolderKanban,
  LayoutGrid,
  ListTodo,
  type LucideIcon,
  Plus,
  Settings,
  SlidersHorizontal,
} from "lucide-react"

import { NavFooter } from "@/components/nav-footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Menu, MenuPopup, MenuTrigger } from "@/components/ui/menu"
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { UserMenuContent } from "@/components/user-menu-content"
import { useInitials } from "@/hooks/use-initials"
import {
  dashboardPath,
  editProjectPath,
  myTasksPath,
  projectMilestonesPath,
  projectPath,
  projectsPath,
  settingsProfilePath,
  tasksPath,
} from "@/routes"
import type { NavItem, Project } from "@/types"

import AppLogoIcon from "./app-logo-icon"

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

// Huly's workbench: a narrow rail of apps on the far left, then the
// navigator for the current app (My tasks, All tasks, your projects).
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset" className="overflow-hidden">
      <div className="flex h-full w-full">
        <AppRail />
        <Navigator />
      </div>
    </Sidebar>
  )
}

function usePath() {
  return usePage().url.split("?")[0]
}

interface RailApp {
  title: string
  href: string
  icon: LucideIcon
  isActive: (path: string) => boolean
}

const railApps: RailApp[] = [
  {
    title: "Tracker",
    href: myTasksPath(),
    icon: FolderKanban,
    isActive: (path) =>
      !path.startsWith(dashboardPath()) && !path.startsWith("/settings"),
  },
  {
    title: "Dashboard",
    href: dashboardPath(),
    icon: LayoutGrid,
    isActive: (path) => path.startsWith(dashboardPath()),
  },
]

function AppRail() {
  const path = usePath()

  return (
    <Sidebar
      collapsible="none"
      className="w-(--sidebar-width-icon) shrink-0 border-sidebar-border border-r"
    >
      <SidebarHeader className="items-center">
        <Link
          href={dashboardPath()}
          aria-label="Home"
          className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"
        >
          <AppLogoIcon className="size-5 fill-current text-white" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="items-center px-0">
          <SidebarMenu className="items-center">
            {railApps.map((app) => (
              <SidebarMenuItem key={app.title}>
                <SidebarMenuButton
                  render={
                    <Link
                      href={app.href}
                      prefetch
                      aria-label={app.title}
                      title={app.title}
                    />
                  }
                  isActive={app.isActive(path)}
                  className="size-8 justify-center p-0"
                >
                  <app.icon />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="items-center">
        <SidebarMenu className="items-center">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link
                  href={settingsProfilePath()}
                  aria-label="Settings"
                  title="Settings"
                />
              }
              isActive={path.startsWith("/settings")}
              className="size-8 justify-center p-0"
            >
              <Settings />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <RailUserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function RailUserMenu() {
  const { auth } = usePage().props
  const getInitials = useInitials()

  return (
    <Menu>
      <MenuTrigger
        aria-label="Account"
        className="flex size-8 items-center justify-center rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Avatar className="size-7">
          <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
          <AvatarFallback className="text-xs">
            {getInitials(auth.user.name)}
          </AvatarFallback>
        </Avatar>
      </MenuTrigger>
      <MenuPopup className="min-w-56" side="right" align="end">
        <UserMenuContent auth={auth} />
      </MenuPopup>
    </Menu>
  )
}

function Navigator() {
  const path = usePath()
  const { sidebar_projects } = usePage().props
  const projects = sidebar_projects ?? []

  return (
    <Sidebar collapsible="none" className="min-w-0 flex-1">
      <SidebarHeader className="h-12 justify-center px-4">
        <span className="font-semibold text-sm">Tracker</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <NavLink
              title="My tasks"
              href={myTasksPath()}
              icon={CircleUserRound}
              active={path === myTasksPath()}
            />
            <NavLink
              title="All tasks"
              href={tasksPath()}
              icon={ListTodo}
              active={path === tasksPath()}
            />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your projects</SidebarGroupLabel>
          <SidebarGroupAction
            render={<Link href={projectsPath()} aria-label="New project" />}
          >
            <Plus />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <ProjectNavItem
                  key={project.id}
                  project={project}
                  path={path}
                />
              ))}
              {projects.length === 0 && (
                <p className="px-2 text-muted-foreground text-xs">
                  No projects yet
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <NavLink
              title="All projects"
              href={projectsPath()}
              icon={FolderKanban}
              active={path === projectsPath()}
            />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} />
      </SidebarFooter>
    </Sidebar>
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

// A project expands into its views, like Huly's Issues / Milestones entries.
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
    {
      title: "Settings",
      href: editProjectPath(project.id),
      icon: SlidersHorizontal,
    },
  ]

  return (
    <Collapsible defaultOpen={isCurrent} render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={<SidebarMenuButton className="group/project" />}
      >
        <ChevronRight className="transition-transform group-data-panel-open/project:rotate-90" />
        <span className="font-mono text-muted-foreground text-xs">
          {project.identifier}
        </span>
        <span>{project.name}</span>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <SidebarMenuSub>
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
