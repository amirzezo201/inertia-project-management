import { useForm } from "@inertiajs/react"
import { Plus } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"

import { PillSelect } from "@/components/property-pills"
import { StatusIcon } from "@/components/tasks/status-icon"
import { assigneePillOptions } from "@/components/tasks/task-pill-options"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { projectsPath } from "@/routes"
import type { Project, StatusCategory, UserSummary } from "@/types"

export interface DefaultStatus {
  name: string
  category: StatusCategory
}

type ProjectForm = {
  name: string
  identifier: string
  description: string
  default_assignee_id: string
  default_status_name: string
}

// Huly's suggestion: uppercase the name, turn spaces and dashes into
// underscores, keep the first five characters.
function suggestIdentifier(name: string) {
  return name
    .toLocaleUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_")
    .replace(/[^A-Z0-9_]/g, "")
    .replace(/^[^A-Z]+/, "")
    .substring(0, 5)
}

interface NewProjectDialogProps {
  projects: Project[]
  users: UserSummary[]
  defaultStatuses: DefaultStatus[]
}

// Huly's "New project" card: label/value rows for title, identifier (used in
// task IDs, fixed after creation), description, default assignee and status.
export function NewProjectDialog({
  projects,
  users,
  defaultStatuses,
}: NewProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [identifierEdited, setIdentifierEdited] = useState(false)
  const form = useForm<ProjectForm>({
    name: "",
    identifier: "",
    description: "",
    default_assignee_id: "",
    default_status_name: defaultStatuses[0]?.name ?? "",
  })

  const identifierTaken = projects.some(
    (project) => project.identifier === form.data.identifier,
  )
  const canSave =
    form.data.name.trim() !== "" &&
    form.data.identifier !== "" &&
    !identifierTaken

  function submit() {
    if (!canSave || form.processing) return
    form.post(projectsPath(), { onSuccess: () => setOpen(false) })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          form.reset()
          form.clearErrors()
          setIdentifierEdited(false)
        }
        setOpen(next)
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <Plus />
        New project
      </DialogTrigger>

      <DialogPopup className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="contents"
        >
          <DialogPanel className="grid gap-4">
            <Row
              label="Project title"
              htmlFor="project_name"
              error={form.errors.name}
            >
              <Input
                id="project_name"
                value={form.data.name}
                placeholder="New project"
                autoFocus
                onChange={(event) => {
                  const name = event.target.value
                  form.setData((data) => ({
                    ...data,
                    name,
                    identifier: identifierEdited
                      ? data.identifier
                      : suggestIdentifier(name),
                  }))
                }}
              />
            </Row>

            <Row
              label="Identifier"
              hint="Used in task IDs"
              htmlFor="project_identifier"
              error={
                identifierTaken
                  ? "Project identifier already exists"
                  : form.errors.identifier
              }
            >
              <Input
                id="project_identifier"
                value={form.data.identifier}
                placeholder="PRJCT"
                maxLength={10}
                className="font-mono uppercase"
                onChange={(event) => {
                  setIdentifierEdited(true)
                  form.setData("identifier", event.target.value.toUpperCase())
                }}
              />
            </Row>

            <Row label="Description" htmlFor="project_description">
              <Input
                id="project_description"
                value={form.data.description}
                placeholder="Add description…"
                onChange={(event) =>
                  form.setData("description", event.target.value)
                }
              />
            </Row>

            <Row label="Default assignee">
              <PillSelect
                label="Default assignee"
                value={form.data.default_assignee_id}
                options={assigneePillOptions(users)}
                onChange={(value) => form.setData("default_assignee_id", value)}
              />
            </Row>

            <Row label="Default task status">
              <PillSelect
                label="Default task status"
                value={form.data.default_status_name}
                options={defaultStatuses.map((status) => ({
                  value: status.name,
                  label: status.name,
                  icon: <StatusIcon category={status.category} />,
                }))}
                onChange={(value) => form.setData("default_status_name", value)}
              />
            </Row>
          </DialogPanel>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={form.processing} disabled={!canSave}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}

function Row({
  label,
  hint,
  htmlFor,
  error,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  error?: string | string[]
  children: ReactNode
}) {
  return (
    <div className="grid items-start gap-1.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <label
        htmlFor={htmlFor}
        className="flex flex-col pt-1.5 font-medium text-sm"
      >
        {label}
        {hint && (
          <span className="font-normal text-muted-foreground text-xs">
            {hint}
          </span>
        )}
      </label>
      <div className="flex flex-col gap-1">
        {children}
        {error && (
          <p className="text-destructive-foreground text-sm">
            {[error].flat().join(" ")}
          </p>
        )}
      </div>
    </div>
  )
}
