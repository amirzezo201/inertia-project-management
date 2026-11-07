import { useForm } from "@inertiajs/react"
import { Info, Plus, X } from "lucide-react"
import { type ReactNode, useState } from "react"

import { PillSelect } from "@/components/property-pills"
import { StatusIcon } from "@/components/tasks/status-icon"
import { assigneePillOptions } from "@/components/tasks/task-pill-options"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

// Plane's rule: keep the letters and digits of the name, up to 10. Ours must
// also start with a letter, so leading digits are dropped.
function suggestIdentifier(name: string) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^[0-9]+/, "")
    .slice(0, 10)
}

interface NewProjectDialogProps {
  projects: Project[]
  users: UserSummary[]
  defaultStatuses: DefaultStatus[]
}

// Plane's "Create project" modal: a cover banner with the project logo,
// "Project name" and "Project ID" side by side, a description, and the
// Lead / default status chips.
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

      <DialogPopup className="max-w-2xl" showCloseButton={false}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="flex min-h-0 flex-col"
        >
          {/* Cover with the logo tile overlapping its bottom edge. */}
          <div className="relative mx-3 mt-3 h-32 rounded-lg bg-gradient-to-br from-primary/24 via-primary/8 to-muted">
            <DialogTitle className="sr-only">Create project</DialogTitle>
            <DialogClose
              aria-label="Close"
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                />
              }
            >
              <X />
            </DialogClose>
            <span className="absolute -bottom-5 left-3 flex size-11 items-center justify-center rounded-md border bg-background font-semibold text-lg text-primary shadow-xs/5">
              {(form.data.identifier || form.data.name || "P")
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <div className="grid gap-x-2 gap-y-3 px-6 pt-9 pb-4 md:grid-cols-4">
            <Field
              className="md:col-span-3"
              label="Project name"
              htmlFor="project_name"
              error={form.errors.name}
            >
              <Input
                id="project_name"
                value={form.data.name}
                placeholder="Project name"
                maxLength={255}
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
            </Field>

            <Field
              label="Project ID"
              htmlFor="project_identifier"
              hint="Helps you identify tasks in the project uniquely. Max 10 characters."
              error={
                identifierTaken
                  ? "Project ID is already taken"
                  : form.errors.identifier
              }
            >
              <Input
                id="project_identifier"
                value={form.data.identifier}
                placeholder="PROJECT"
                maxLength={10}
                className="font-mono uppercase"
                onChange={(event) => {
                  setIdentifierEdited(true)
                  form.setData("identifier", event.target.value.toUpperCase())
                }}
              />
            </Field>

            <div className="md:col-span-4">
              <Textarea
                aria-label="Description"
                value={form.data.description}
                placeholder="Description"
                rows={3}
                onChange={(event) =>
                  form.setData("description", event.target.value)
                }
              />
            </div>

            <div className="flex flex-wrap gap-1.5 md:col-span-4">
              <PillSelect
                variant="chip"
                label="Lead"
                value={form.data.default_assignee_id}
                options={assigneePillOptions(users, "Lead")}
                onChange={(value) => form.setData("default_assignee_id", value)}
              />
              <PillSelect
                variant="chip"
                label="Default status"
                value={form.data.default_status_name}
                options={defaultStatuses.map((status) => ({
                  value: status.name,
                  label: status.name,
                  icon: <StatusIcon category={status.category} />,
                }))}
                onChange={(value) => form.setData("default_status_name", value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" loading={form.processing} disabled={!canSave}>
              {form.processing ? "Creating" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string | string[]
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1 flex items-center gap-1 font-medium text-muted-foreground text-xs"
      >
        {label}
        {hint && (
          <span title={hint} className="inline-flex">
            <Info className="size-3" aria-label={hint} />
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-destructive-foreground text-xs">
          {[error].flat().join(" ")}
        </p>
      )}
    </div>
  )
}
