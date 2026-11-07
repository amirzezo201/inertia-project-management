import { useForm } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { useState } from "react"

import { ProjectLogo } from "@/components/projects/project-logo"
import { DateRangePill, PillSelect } from "@/components/property-pills"
import { milestoneStatusPillOptions } from "@/components/tasks/task-pill-options"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { projectMilestonesPath } from "@/routes"
import type { Project } from "@/types"

type MilestoneForm = {
  name: string
  description: string
  status: string
  start_date: string
  target_date: string
}

const BLANK: MilestoneForm = {
  name: "",
  description: "",
  status: "planned",
  start_date: "",
  target_date: "",
}

// Plane's "Create cycle" modal, for milestones: project, title, description,
// a date-range chip and status.
export function NewMilestoneDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const form = useForm<MilestoneForm>(BLANK)

  function submit() {
    if (form.data.name.trim() === "" || form.processing) return
    form.post(projectMilestonesPath(project.id), {
      onSuccess: () => setOpen(false),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          form.setData(BLANK)
          form.clearErrors()
        }
        setOpen(next)
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <Plus />
        New milestone
      </DialogTrigger>

      <DialogPopup className="max-w-xl">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="flex min-h-0 flex-col"
        >
          <header className="flex items-center gap-2 px-6 pe-12 pt-5">
            <Badge variant="outline" className="gap-1.5">
              <ProjectLogo project={project} className="size-3.5" />
              {project.name}
            </Badge>
            <DialogTitle className="font-semibold text-base">
              Create milestone
            </DialogTitle>
          </header>

          <div className="flex flex-col gap-3 px-6 py-4">
            <div>
              <input
                aria-label="Title"
                value={form.data.name}
                onChange={(event) => form.setData("name", event.target.value)}
                placeholder="Title"
                autoFocus
                className="w-full bg-transparent font-medium text-xl outline-none placeholder:text-muted-foreground/72"
              />
              {form.errors.name && (
                <p className="mt-1 text-destructive-foreground text-xs">
                  Title {[form.errors.name].flat().join(" ")}
                </p>
              )}
            </div>
            <Textarea
              aria-label="Description"
              value={form.data.description}
              onChange={(event) =>
                form.setData("description", event.target.value)
              }
              placeholder="Description"
              rows={3}
            />
            <div className="flex flex-wrap gap-1.5">
              <DateRangePill
                from={form.data.start_date}
                to={form.data.target_date}
                onChange={({ from, to }) =>
                  form.setData((data) => ({
                    ...data,
                    start_date: from,
                    target_date: to,
                  }))
                }
              />
              <PillSelect
                variant="chip"
                label="Status"
                value={form.data.status}
                options={milestoneStatusPillOptions()}
                onChange={(value) => form.setData("status", value)}
              />
            </div>
            {form.errors.target_date && (
              <p className="text-destructive-foreground text-xs">
                End date {[form.errors.target_date].flat().join(" ")}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              loading={form.processing}
              disabled={form.data.name.trim() === ""}
            >
              Create milestone
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
