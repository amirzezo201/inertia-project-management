import { Link, router, usePage } from "@inertiajs/react"
import {
  CircleUserRound,
  FolderKanban,
  House,
  ListTodo,
  Search,
  Settings,
} from "lucide-react"
import { Fragment, type ReactNode, useEffect, useState } from "react"

import AppLogoIcon from "@/components/app-logo-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Menu, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import { UserMenuContent } from "@/components/user-menu-content"
import { useInitials } from "@/hooks/use-initials"
import {
  dashboardPath,
  myTasksPath,
  projectMilestonesPath,
  projectPath,
  projectsPath,
  settingsProfilePath,
  tasksPath,
} from "@/routes"

// Plane's top bar: workspace on the left, "Search commands..." in the
// middle, the account menu on the right.
export function AppTopBar() {
  return (
    <div className="flex h-10 w-full shrink-0 items-center gap-2 px-3.5">
      <Link
        href={dashboardPath()}
        className="flex min-w-0 items-center gap-2 rounded-sm p-1 hover:bg-sidebar-accent"
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
          <AppLogoIcon className="size-3.5 fill-current text-white" />
        </span>
        <span className="truncate font-medium text-sm">
          {import.meta.env.VITE_APP_NAME ?? "RunwellForAgents"}
        </span>
      </Link>

      <div className="flex flex-1 justify-center">
        <CommandSearch />
      </div>

      <AccountMenu />
    </div>
  )
}

interface PaletteItem {
  value: string
  label: string
  href: string
  icon: ReactNode
}

interface PaletteGroup {
  value: string
  items: PaletteItem[]
}

function CommandSearch() {
  const [open, setOpen] = useState(false)
  const { sidebar_projects } = usePage().props

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const groups: PaletteGroup[] = [
    {
      value: "Navigate",
      items: [
        {
          value: "home",
          label: "Home",
          href: dashboardPath(),
          icon: <House />,
        },
        {
          value: "my-tasks",
          label: "My tasks",
          href: myTasksPath(),
          icon: <CircleUserRound />,
        },
        {
          value: "all-tasks",
          label: "All tasks",
          href: tasksPath(),
          icon: <ListTodo />,
        },
        {
          value: "projects",
          label: "All projects",
          href: projectsPath(),
          icon: <FolderKanban />,
        },
        {
          value: "settings",
          label: "Settings",
          href: settingsProfilePath(),
          icon: <Settings />,
        },
      ],
    },
    {
      value: "Projects",
      items: (sidebar_projects ?? []).flatMap((project) => [
        {
          value: `project-${project.id}-tasks`,
          label: `${project.name} › Tasks`,
          href: projectPath(project.id),
          icon: <ListTodo />,
        },
        {
          value: `project-${project.id}-milestones`,
          label: `${project.name} › Milestones`,
          href: projectMilestonesPath(project.id),
          icon: <FolderKanban />,
        },
      ]),
    },
  ].filter((group) => group.items.length > 0)

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-7 w-full max-w-91 items-center gap-2 rounded-lg border bg-background px-2 text-muted-foreground text-xs hover:border-ring/40"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search commands...</span>
        <KbdGroup className="hidden sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>
      <CommandDialogPopup aria-label="Search commands">
        <Command items={groups}>
          <CommandInput placeholder="Search commands..." />
          <CommandPanel>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              {(group: PaletteGroup) => (
                <Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: PaletteItem) => (
                        <CommandItem
                          key={item.value}
                          value={item.label}
                          onClick={() => {
                            setOpen(false)
                            router.visit(item.href)
                          }}
                          className="gap-2 [&_svg]:size-4 [&_svg]:text-muted-foreground"
                        >
                          {item.icon}
                          {item.label}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                  <CommandSeparator />
                </Fragment>
              )}
            </CommandList>
          </CommandPanel>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  )
}

function AccountMenu() {
  const { auth } = usePage().props
  const getInitials = useInitials()

  return (
    <Menu>
      <MenuTrigger
        aria-label="Account"
        className="flex size-7 items-center justify-center rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-6">
          <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
          <AvatarFallback className="text-[0.625rem]">
            {getInitials(auth.user.name)}
          </AvatarFallback>
        </Avatar>
      </MenuTrigger>
      <MenuPopup className="min-w-56" align="end">
        <UserMenuContent auth={auth} />
      </MenuPopup>
    </Menu>
  )
}
