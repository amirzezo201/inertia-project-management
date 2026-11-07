import { useForm } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { useState } from "react"

import { DatePill, PillSelect } from "@/components/property-pills"
import { RichTextEditor } from "@/components/rich-text-editor"
import { milestoneStatusPillOptions } from "@/components/tasks/task-pill-options"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogFooter,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { projectMilestonesPath } from "@/routes"
import type { Project } from "@/types"

type MilestoneForm = {
  name: string
  description: string
  status: string
  start_date: string
  target_date: string
}

// Huly defaults a new milestone's target date to two weeks out.
function twoWeeksFromToday() {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Huly's "New Milestone" card: project in the header, name, optional rich-text
// description, and Status / Start date / Target date buttons.
export function NewMilestoneDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [editorKey, setEditorKey] = useState(0)
  const form = useForm<MilestoneForm>({
    name: "",
    description: "",
    status: "planned",
    start_date: "",
    target_date: "",
  })

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
          form.setData({
            name: "",
            description: "",
            status: "planned",
            start_date: "",
            target_date: twoWeeksFromToday(),
          })
          form.clearErrors()
          setEditorKey((key) => key + 1)
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
            <Badge variant="outline" className="font-mono">
              {project.identifier}
            </Badge>
            <span className="text-muted-foreground text-sm">›</span>
            <DialogTitle className="font-medium text-sm">
              New milestone
            </DialogTitle>
          </header>

          <div className="flex flex-col gap-2 px-6 py-4">
            <input
              aria-label="Milestone name"
              value={form.data.name}
              onChange={(event) => form.setData("name", event.target.value)}
              placeholder="Milestone name"
              autoFocus
              className="w-full bg-transparent font-semibold text-lg outline-none placeholder:text-muted-foreground/72"
            />
            {form.errors.name && (
              <p className="text-destructive-foreground text-sm">
                Name {[form.errors.name].flat().join(" ")}
              </p>
            )}
            <RichTextEditor
              key={editorKey}
              placeholder="Description (optional)"
              onChange={(html) => form.setData("description", html)}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 px-6 pb-4">
            <PillSelect
              label="Status"
              value={form.data.status}
              options={milestoneStatusPillOptions()}
              onChange={(value) => form.setData("status", value)}
            />
            <DatePill
              label="Start date"
              value={form.data.start_date}
              onChange={(value) => form.setData("start_date", value)}
            />
            <DatePill
              label="Target date"
              value={form.data.target_date}
              onChange={(value) => form.setData("target_date", value)}
            />
          </div>

          {form.errors.target_date && (
            <p className="px-6 pb-3 text-destructive-foreground text-sm">
              Target date {[form.errors.target_date].flat().join(" ")}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.processing}
              disabled={form.data.name.trim() === ""}
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
