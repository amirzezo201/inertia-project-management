import { Head } from "@inertiajs/react"
import { Flag } from "lucide-react"
import { ProjectLogo } from "@/components/common/ProjectLogo"
import { PageHeader } from "@/components/common/page/PageHeader"
import AppLayout from "@/components/layout/AppLayout"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { projectMilestonesPath, projectPath } from "@/routes"
import type { MilestoneSummary, ProjectProps } from "@/types"

import { MilestoneRow } from "./components/MilestoneRow"
import { NewMilestoneDialog } from "./components/NewMilestoneDialog"

export default function MilestonesIndex({
  project,
  milestones,
  mode,
}: Omit<ProjectProps, "milestones"> & {
  milestones: MilestoneSummary[]
  mode: string
}) {
  const href = (mode?: string) =>
    projectMilestonesPath(project.id, mode ? { mode } : {})
  const modes = [
    { value: "all", label: "All", href: href() },
    { value: "planned", label: "Planned", href: href("planned") },
    { value: "active", label: "Active", href: href("active") },
    { value: "closed", label: "Closed", href: href("closed") },
  ]

  return (
    <AppLayout
      header={
        <PageHeader
          breadcrumbs={[
            {
              title: project.name,
              href: projectPath(project.id),
              icon: <ProjectLogo project={project} />,
            },
            { title: "Milestones", icon: <Flag /> },
          ]}
          count={milestones.length}
          actions={<NewMilestoneDialog project={project} />}
          modes={modes}
          mode={mode}
        />
      }
    >
      <Head title={`${project.name} milestones`} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {milestones.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Flag />
              </EmptyMedia>
              <EmptyTitle>No milestones</EmptyTitle>
              <EmptyDescription>
                {mode === "all"
                  ? "Group tasks toward a goal with a target date."
                  : "Nothing in this view."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y rounded-lg border">
            {milestones.map((milestone) => (
              <MilestoneRow key={milestone.id} milestone={milestone} />
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  )
}
