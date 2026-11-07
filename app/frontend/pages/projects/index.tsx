import { Head, Link } from "@inertiajs/react"
import { FolderKanban } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import {
  type DefaultStatus,
  NewProjectDialog,
} from "@/components/projects/new-project-dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AppLayout from "@/layouts/app-layout"
import { projectPath } from "@/routes"
import type { Project, UserSummary } from "@/types"

interface ProjectsIndexProps {
  projects: Project[]
  users: UserSummary[]
  default_statuses: DefaultStatus[]
}

// Huly's "All projects": a table of every project.
export default function ProjectsIndex({
  projects,
  users,
  default_statuses,
}: ProjectsIndexProps) {
  return (
    <AppLayout
      header={
        <PageHeader
          icon={<FolderKanban />}
          title="All projects"
          actions={
            <NewProjectDialog
              projects={projects}
              users={users}
              defaultStatuses={default_statuses}
            />
          }
        />
      }
    >
      <Head title="Projects" />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {projects.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderKanban />
              </EmptyMedia>
              <EmptyTitle>No projects yet</EmptyTitle>
              <EmptyDescription>
                Projects hold your tasks and milestones.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={projectPath(project.id)}
                      prefetch
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-xs">
                    {project.identifier}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">
                    {project.description}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AppLayout>
  )
}
