import { router, usePage } from "@inertiajs/react"
import {
  CircleUserRound,
  FolderKanban,
  House,
  ListTodo,
  Search,
  Settings,
} from "lucide-react"
import { Fragment, type ReactNode, useEffect, useState } from "react"

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
import {
  dashboardPath,
  myTasksPath,
  projectMilestonesPath,
  projectPath,
  projectsPath,
  settingsProfilePath,
  tasksPath,
} from "@/routes"

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

export function AppSidebarSearch() {
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
        className="flex h-8 w-full items-center gap-2 rounded-md border bg-background px-2 text-muted-foreground text-sm hover:border-ring/40"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search...</span>
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
